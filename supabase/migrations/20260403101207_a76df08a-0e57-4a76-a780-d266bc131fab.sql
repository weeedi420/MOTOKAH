
-- Enums
CREATE TYPE public.seller_type AS ENUM ('private', 'dealer');
CREATE TYPE public.listing_status AS ENUM ('pending', 'approved', 'sold', 'rejected');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Timestamp updater
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  seller_type public.seller_type NOT NULL DEFAULT 'private',
  verified_at TIMESTAMP WITH TIME ZONE,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Listings
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TZS',
  mileage INTEGER,
  transmission TEXT,
  fuel_type TEXT,
  body_type TEXT,
  color TEXT,
  condition TEXT NOT NULL DEFAULT 'Used',
  description TEXT,
  city TEXT,
  status public.listing_status NOT NULL DEFAULT 'pending',
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_listings_seller ON public.listings(seller_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_make ON public.listings(make);

-- Listing Images
CREATE TABLE public.listing_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_listing_images_listing ON public.listing_images(listing_id);

-- Wishlist
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Conversations
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);

-- Reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user ON public.notifications(user_id);

-- User Roles (separate table per security rules)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper functions (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_participant_in_conversation(_conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = _conversation_id 
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS POLICIES ============

-- Profiles
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Listings
CREATE POLICY "Anyone can view approved listings" ON public.listings FOR SELECT USING (status = 'approved' OR seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can create listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Owners can update own listings" ON public.listings FOR UPDATE USING (seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can delete own listings" ON public.listings FOR DELETE USING (seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Listing Images
CREATE POLICY "Anyone can view listing images" ON public.listing_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND (status = 'approved' OR seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Owners can insert listing images" ON public.listing_images FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND seller_id = auth.uid())
);
CREATE POLICY "Owners can update listing images" ON public.listing_images FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND seller_id = auth.uid())
);
CREATE POLICY "Owners can delete listing images" ON public.listing_images FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND (seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);

-- Wishlist
CREATE POLICY "Users can view own wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to wishlist" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from wishlist" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

-- Conversations
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT USING (participant1_id = auth.uid() OR participant2_id = auth.uid());
CREATE POLICY "Authenticated can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Participants can update conversations" ON public.conversations FOR UPDATE USING (participant1_id = auth.uid() OR participant2_id = auth.uid());

-- Messages
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT USING (public.is_participant_in_conversation(conversation_id));
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND public.is_participant_in_conversation(conversation_id));
CREATE POLICY "Participants can update messages" ON public.messages FOR UPDATE USING (public.is_participant_in_conversation(conversation_id));

-- Reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = reviewer_id OR public.has_role(auth.uid(), 'admin'));

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- User Roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);

CREATE POLICY "Anyone can view listing images" ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');
CREATE POLICY "Authenticated users can upload listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own listing images" ON storage.objects FOR UPDATE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own listing images" ON storage.objects FOR DELETE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
