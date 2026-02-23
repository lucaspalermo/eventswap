/**
 * Storage bucket setup for Supabase
 * Run these in the Supabase dashboard SQL editor:
 *
 * INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);
 * INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
 * INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false);
 * INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', false);
 *
 * -- Policies for listing-images (public read, auth write)
 * CREATE POLICY "Public read listing images" ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');
 * CREATE POLICY "Auth upload listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');
 * CREATE POLICY "Own delete listing images" ON storage.objects FOR DELETE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
 *
 * -- Policies for avatars (public read, own write)
 * CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
 * CREATE POLICY "Auth upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
 * CREATE POLICY "Own delete avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
 *
 * -- Policies for contracts (private, auth only)
 * CREATE POLICY "Auth read contracts" ON storage.objects FOR SELECT USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');
 * CREATE POLICY "Auth upload contracts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'contracts' AND auth.role() = 'authenticated');
 *
 * -- Policies for chat-attachments (private, auth only)
 * CREATE POLICY "Auth read chat attachments" ON storage.objects FOR SELECT USING (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');
 * CREATE POLICY "Auth upload chat attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');
 */

export const STORAGE_BUCKETS = {
  listings: 'listing-images',
  avatars: 'avatars',
  contracts: 'contracts',
  chat: 'chat-attachments',
} as const
