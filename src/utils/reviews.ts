import { ArtworkReview, User } from '../types';

const REVIEWS_STORAGE_KEY = 'botanical_gallery_reviews';

// No pre-seeded AI generated reviews - only genuine visitor and collector reflections
const INITIAL_REVIEWS: ArtworkReview[] = [];

export function isUserAdmin(user?: User | null): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.isAdmin === true || user.email === 'admin123@gmail.com';
}

export function getStoredReviews(): ArtworkReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    const parsed: ArtworkReview[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return INITIAL_REVIEWS;
    }

    // Purge any legacy AI generated/seeded reviews from previous builds
    const cleaned = parsed.filter(
      (r) =>
        r &&
        !r.userId?.startsWith('seed-user') &&
        !['rev-1', 'rev-2', 'rev-3', 'rev-4', 'rev-5'].includes(r.id)
    );

    if (cleaned.length !== parsed.length) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(cleaned));
    }

    return cleaned;
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function getReviewsForArtwork(artworkId: string): ArtworkReview[] {
  const all = getStoredReviews();
  return all
    .filter((r) => r.artworkId === artworkId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addArtworkReview(
  artworkId: string,
  user: User,
  rating: number,
  comment: string
): { success: boolean; review?: ArtworkReview; error?: string } {
  const cleanComment = comment.trim();
  if (!cleanComment) {
    return { success: false, error: 'Please enter a review comment.' };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: 'Please select a rating between 1 and 5 stars.' };
  }

  const newReview: ArtworkReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    artworkId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    rating,
    comment: cleanComment,
    createdAt: new Date().toISOString(),
  };

  const all = getStoredReviews();
  all.unshift(newReview);

  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Continue
  }

  return { success: true, review: newReview };
}

export function deleteArtworkReview(
  reviewId: string,
  user?: User | null
): { success: boolean; error?: string } {
  if (!user) {
    return { success: false, error: 'You must be signed in to delete reviews.' };
  }

  const all = getStoredReviews();
  const target = all.find((r) => r.id === reviewId);
  if (!target) {
    return { success: false, error: 'Review not found.' };
  }

  const admin = isUserAdmin(user);
  const isAuthor = target.userId === user.id;

  if (!admin && !isAuthor) {
    return { success: false, error: 'Only administrators or the author may delete this review.' };
  }

  const updated = all.filter((r) => r.id !== reviewId);
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Continue
  }

  return { success: true };
}

export function updateArtworkReview(
  reviewId: string,
  rating: number,
  comment: string,
  user?: User | null
): { success: boolean; updatedReview?: ArtworkReview; error?: string } {
  if (!user) {
    return { success: false, error: 'You must be signed in to edit reviews.' };
  }

  const cleanComment = comment.trim();
  if (!cleanComment) {
    return { success: false, error: 'Please enter a comment.' };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: 'Please select a rating between 1 and 5 stars.' };
  }

  const all = getStoredReviews();
  const targetIndex = all.findIndex((r) => r.id === reviewId);
  if (targetIndex === -1) {
    return { success: false, error: 'Review not found.' };
  }

  const target = all[targetIndex];
  const admin = isUserAdmin(user);
  const isAuthor = target.userId === user.id;

  if (!admin && !isAuthor) {
    return { success: false, error: 'Only administrators or the author may edit this review.' };
  }

  const updatedReview: ArtworkReview = {
    ...target,
    rating,
    comment: cleanComment,
    editedAt: new Date().toISOString(),
  };

  all[targetIndex] = updatedReview;

  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Continue
  }

  return { success: true, updatedReview };
}
