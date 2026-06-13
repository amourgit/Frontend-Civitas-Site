
import {
  Heart,
  MessageSquare,
  Repeat,
  Share2,
  MoreVertical,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import CommentsPage from "./commentPost";

interface PostCommunityProps {
  id: string;
  author: string;
  username: string;
  timestamp: string;
  content: string;
  hashtags: string[];
  hasMedia: boolean;
  mediaGradient?: string;
  comments: string;
  retweets: string;
  likes: string;
  views: string;
  verified?: boolean;
  commentsList?: Comment[];
}

export default function PostCommunity({
  author,
  username,
  timestamp,
  content,
  hashtags,
  hasMedia,
  mediaGradient = "from-purple-600 to-purple-900",
  comments,
  retweets,
  likes,
  views,
  verified = true,
  commentsList = [],
}: PostCommunityProps) {
  const [showComments, setShowComments] = useState(false);
  const hasComments = commentsList && commentsList.length > 0;

  return (
    <div className="border-b border-white/10 pb-4">
      <div className="flex items-start gap-3">
        <div className="sticky top-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0">
          <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
            X
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{author}</span>
              {verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px]">✓</span>
                </div>
              )}
              <span className="text-gray-400 text-sm">
                {username} · {timestamp}
              </span>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <p className="text-white text-sm mb-2 leading-relaxed">
            {content}{" "}
            {hashtags.map((tag, i) => (
              <span key={i} className="text-blue-400">
                {tag}{" "}
              </span>
            ))}
          </p>

          {/* Media */}
          {hasMedia && (
            <div
              className={`w-full h-48 rounded-2xl bg-gradient-to-br ${mediaGradient} mb-3 relative overflow-hidden`}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="text-8xl font-bold text-white/30">X</div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between text-gray-400 text-sm mb-3">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 hover:text-blue-400 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{comments}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
          <Repeat className="w-4 h-4" />
          <span>{retweets}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-pink-400 transition-colors">
          <Heart className="w-4 h-4" />
          <span>{likes}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
          <span>📊 {views}</span>
        </button>
        <button className="hover:text-blue-400 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Comments Section */}
      {hasComments && showComments && (
        <div className="flex items-start justify-center mt-2 pt-2">
          <CommentsPage ListComments={commentsList} />
        </div>
      )}
    </div>
  );
}
