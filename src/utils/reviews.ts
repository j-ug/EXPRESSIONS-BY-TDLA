import { ArtworkReview, User } from '../types';

const REVIEWS_STORAGE_KEY = 'botanical_gallery_reviews';

const INITIAL_REVIEWS: ArtworkReview[] = [
  {
    id: 'rev-1',
    artworkId: 'artwork-1',
    userId: 'seed-user-1',
    userName: 'Dr. M. Soundararajan',
    userEmail: 'soundar@herbarium.org',
    rating: 5,
    comment: 'The microscopic preservation of the secondary xylem and phloem lattice is extraordinary. The vermillion madder accentuates the organic geometry with quiet spiritual reverence.',
    createdAt: '2024-05-12T10:30:00.000Z',
  },
  {
    id: 'rev-2',
    artworkId: 'artwork-1',
    userId: 'seed-user-2',
    userName: 'Priya Meenakshi',
    userEmail: 'priya.m@artsociety.in',
    rating: 5,
    comment: 'Observed this from Chennai. The translucent fragility of the sacred peepal leaf held against the bias glow evokes the quiet rhythm of the Kaveri riverbed.',
    createdAt: '2024-06-20T14:15:00.000Z',
  },
  {
    id: 'rev-3',
    artworkId: 'artwork-2',
    userId: 'seed-user-3',
    userName: 'Kavitha Ramachandran',
    userEmail: 'kavitha.r@curator.net',
    rating: 5,
    comment: 'The concentric placement of pressed sunrise lotus petals mimics the sacred architecture of temple water tanks. Remarkable preservation of natural cellular tint.',
    createdAt: '2024-07-04T09:45:00.000Z',
  },
  {
    id: 'rev-4',
    artworkId: 'artwork-3',
    userId: 'seed-user-4',
    userName: 'David Vance',
    userEmail: 'vance.d@botanicalarts.co.uk',
    rating: 5,
    comment: 'Palmyra fronds are notoriously difficult to score without fracturing the vascular bundles. Dr. Ophylia’s technique demonstrates master-level craft.',
    createdAt: '2024-08-11T16:20:00.000Z',
  },
  {
    id: 'rev-5',
    artworkId: 'artwork-4',
    userId: 'seed-user-5',
    userName: 'Dr. Anbu Selvan',
    userEmail: 'anbu@bharathidasan.edu',
    rating: 5,
    comment: 'The aromatic presence of preserved vilvam leaves framed in circular sacred harmony is a triumph. A true homage to Tiruchy heritage.',
    createdAt: '2024-09-02T11:00:00.000Z',
  },
];

export function getStoredReviews(): ArtworkReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(raw);
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
