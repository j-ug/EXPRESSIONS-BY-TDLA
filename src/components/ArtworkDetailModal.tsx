import React, { useEffect, useRef, useState } from 'react';
import { BotanicalArtwork, User, ArtworkReview } from '../types';
import { createArtworkTexture } from '../utils/textureGenerator';
import { getReviewsForArtwork, addArtworkReview } from '../utils/reviews';
import {
  X,
  Sparkles,
  Layers,
  Calendar,
  Compass,
  Share2,
  Check,
  Star,
  MessageSquare,
  LogIn,
  Send,
  User as UserIcon,
} from 'lucide-react';
import { ARTIST_INFO } from '../data/artworks';

interface ArtworkDetailModalProps {
  artwork: BotanicalArtwork | null;
  onClose: () => void;
  currentUser?: User | null;
  onOpenAuth?: () => void;
}

export const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({
  artwork,
  onClose,
  currentUser,
  onOpenAuth,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [reviews, setReviews] = useState<ArtworkReview[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!artwork) return;
    const revs = getReviewsForArtwork(artwork.id);
    setReviews(revs);
    setReviewError(null);
    setReviewSuccess(false);
    setNewComment('');

    if (canvasRef.current) {
      const tex = createArtworkTexture(artwork.textureTheme, artwork.customImageData);
      const sourceCanvas = tex.image as HTMLCanvasElement;
      const destCanvas = canvasRef.current;
      if (sourceCanvas && destCanvas) {
        destCanvas.width = sourceCanvas.width;
        destCanvas.height = sourceCanvas.height;
        const ctx = destCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(sourceCanvas, 0, 0);
        }
      }
    }
  }, [artwork]);

  if (!artwork) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${artwork.title} — Dr. G. Ophylia Vinodhini`,
          text: `${artwork.title} (${artwork.medium}) by Dr. G. Ophylia Vinodhini`,
          url: window.location.href,
        });
        return;
      } catch {
        // Ignored if user dismissed share sheet
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);

    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!newComment.trim()) {
      setReviewError('Please write a brief comment or reflection.');
      return;
    }

    const res = addArtworkReview(artwork.id, currentUser, newRating, newComment);
    if (res.success && res.review) {
      setReviews([res.review, ...reviews]);
      setNewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } else {
      setReviewError(res.error || 'Failed to submit review.');
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#20160d]/50 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#fffdf9] border border-[#ded0be] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#f5ece0] hover:bg-[#ede0ce] text-[#5e4530] hover:text-[#2d1f14] transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start overflow-y-auto pr-1">
          {/* Canvas Preview with frame preview */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            <div
              className="relative p-2 rounded-2xl shadow-xl transition-transform hover:scale-[1.01] w-full"
              style={{
                boxShadow: `0 0 45px ${artwork.biasLightColor}44`,
                border: `2px solid ${artwork.biasLightColor}66`,
              }}
            >
              <canvas
                ref={canvasRef}
                className="w-full max-h-[400px] object-contain rounded-xl shadow-lg bg-[#fbf7f1]"
              />
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 30px ${artwork.biasLightColor}22`,
                }}
              />
            </div>
            <p className="text-[11px] font-mono text-[#7d6148] mt-3 uppercase tracking-wider">
              {artwork.dimensions} • {artwork.frameShape} custom mount
            </p>

            {/* Actions */}
            <div className="w-full flex items-center gap-2.5 mt-4">
              <a
                href={`mailto:${ARTIST_INFO.email}?subject=Acquisition%20Inquiry%20for%20${encodeURIComponent(
                  artwork.title
                )}`}
                className="flex-1 py-2 px-3 rounded-xl bg-[#85582f] hover:bg-[#6e4622] text-[#fffefa] text-xs font-semibold text-center border border-[#9e6d3d] transition-all shadow-sm"
              >
                Inquire for Acquisition
              </a>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-[#f5ecdf] hover:bg-[#ede0ce] text-[#6b5038] border border-[#ded0be] transition-colors cursor-pointer text-xs"
                title="Share artwork"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#85582f]" />
                    <span className="text-[#85582f] font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Detailed Botanical Information & Reviews */}
          <div className="md:col-span-6 flex flex-col space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: artwork.biasLightColor }}
                  />
                  <span className="text-xs uppercase font-mono tracking-widest text-[#78573a]">
                    Botanical Specimen Plate
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#85582f] font-semibold font-mono">
                  <Star className="w-3.5 h-3.5 fill-[#85582f] text-[#85582f]" />
                  <span>{averageRating}</span>
                  <span className="text-[#8c6f55] font-normal">({reviews.length})</span>
                </div>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-[#2d1f14] leading-tight mb-1">
                {artwork.title}
              </h2>
              {artwork.tamilTitle && (
                <p className="font-serif text-sm text-[#73543b] mb-3">
                  {artwork.tamilTitle}
                </p>
              )}
            </div>

            <div className="space-y-2.5 text-xs text-[#523e2d] pb-3 border-b border-[#ded0be]">
              <div className="flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-[#8c5e34] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#7d6148]">Medium & Technique</div>
                  <div className="text-xs font-serif italic text-[#2d1f14]">{artwork.medium}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#8c5e34] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#7d6148]">Flora Species Preserved</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {artwork.botanicalSpecies.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[#f5ecdf] border border-[#ded0be] text-[#4d3725] text-[11px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Compass className="w-4 h-4 text-[#8c5e34] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#7d6148]">Ecological Provenance</div>
                  <div>River Kaveri Basin, Tiruchirappalli, Tamil Nadu, India</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#8c5e34] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#7d6148]">Year of Creation</div>
                  <div>{artwork.year}</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#f8f2e7] border border-[#dfd2c1] text-xs text-[#594432] leading-relaxed">
              <span className="font-semibold text-[#2d1f14] block mb-0.5">Inspiration:</span>
              {artwork.inspiration}
            </div>

            {/* Reviews Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#85582f]" />
                  <h3 className="font-serif text-base text-[#2d1f14]">
                    Reviews & Visitor Reflections
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#8c6f55]">
                  {reviews.length} {reviews.length === 1 ? 'reflection' : 'reflections'}
                </span>
              </div>

              {/* Review input or sign-in prompt */}
              {currentUser ? (
                <form onSubmit={handlePostReview} className="mb-3.5 p-3 rounded-2xl bg-[#f9f3e9] border border-[#ded0be] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-[#2d1f14] font-medium">
                      <UserIcon className="w-3.5 h-3.5 text-[#85582f]" />
                      <span>{currentUser.name}</span>
                    </div>
                    {/* Interactive Stars */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              (hoverRating || newRating) >= star
                                ? 'fill-[#85582f] text-[#85582f]'
                                : 'text-[#d6c4b2]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on this specimen..."
                    className="w-full px-3 py-1.5 rounded-xl bg-[#fffefc] border border-[#d6c4af] text-xs text-[#2d1f14] focus:outline-none focus:border-[#85582f] resize-none"
                  />

                  {reviewError && (
                    <p className="text-[11px] text-[#a33232]">{reviewError}</p>
                  )}
                  {reviewSuccess && (
                    <p className="text-[11px] text-[#2c6e3b]">Review submitted successfully!</p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-xl bg-[#85582f] hover:bg-[#6e4622] text-[#fffefa] text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post Reflection</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-3.5 p-3 rounded-2xl bg-[#f9f3e9] border border-[#ded0be] flex items-center justify-between gap-2">
                  <div className="text-left">
                    <p className="text-xs font-medium text-[#2d1f14]">
                      Leave a Review or Comment
                    </p>
                    <p className="text-[11px] text-[#6e543f]">
                      Sign in with your email & password to comment.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="px-3 py-1.5 rounded-xl bg-[#85582f] hover:bg-[#6e4622] text-[#fffefa] text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}

              {/* Existing Reviews */}
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {reviews.length === 0 ? (
                  <p className="text-xs text-[#8c6f55] italic text-center py-2">
                    No reflections yet. Sign in to leave the first comment.
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-2.5 rounded-xl bg-[#fffefc] border border-[#ebdccb] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#2d1f14]">{rev.userName}</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating
                                  ? 'fill-[#85582f] text-[#85582f]'
                                  : 'text-[#dfd0bd]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[#574232] leading-relaxed">{rev.comment}</p>
                      <div className="text-[10px] font-mono text-[#947860]">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
