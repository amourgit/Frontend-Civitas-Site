
import { motion } from "framer-motion";
import { CalendarIcon, ClockIcon, PersonIcon, ArrowTopRightIcon, FileTextIcon, BookmarkIcon } from "@radix-ui/react-icons";

// Interface pour les props des cards
interface ProjectCardProps {
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  teamMembers: number;
  priority: "low" | "medium" | "high";
  tags: string[];
}

interface NewsCardProps {
  title: string;
  summary: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  image?: string;
}

// Card de projet avec design moderne
export const ProjectCard = ({ title, description, progress, dueDate, teamMembers, priority, tags }: ProjectCardProps) => {
  const priorityColors = {
    low: "bg-green-500",
    medium: "bg-yellow-500", 
    high: "bg-red-500"
  };

  const priorityBorders = {
    low: "border-green-200",
    medium: "border-yellow-200",
    high: "border-red-200"
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl p-6 shadow-lg border-l-4 ${priorityBorders[priority]} hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${priorityColors[priority]}`} />
          <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        </div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {priority}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Progression</span>
          <span className="text-xs font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Informations du projet */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 text-gray-500">
          <CalendarIcon className="w-4 h-4" />
          <span className="text-xs">{dueDate}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <PersonIcon className="w-4 h-4" />
          <span className="text-xs">{teamMembers} membres</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
          >
            <BookmarkIcon className="w-3 h-3" />
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

// Card de news/article avec design magazine
export const NewsCard = ({ title, summary, author, publishDate, readTime, category, image }: NewsCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      {image && (
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-800 rounded-full">
              {category}
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <ArrowTopRightIcon className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
            {category}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 text-xl mb-3 leading-tight hover:text-blue-600 transition-colors cursor-pointer">
          {title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
          {summary}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {author.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{author}</p>
              <p className="text-xs text-gray-500">{publishDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-500">
            <ClockIcon className="w-4 h-4" />
            <span className="text-xs">{readTime}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Card d'activité récente
export const ActivityCard = ({ activity }: { activity: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
        <div>
          <p className="text-sm text-gray-700">{activity}</p>
          <p className="text-xs text-gray-500 mt-1">Il y a 2 heures</p>
        </div>
      </div>
    </motion.div>
  );
};

// Card de statistiques
export const StatsCard = ({ title, value, trend, icon: Icon }: { 
  title: string; 
  value: string; 
  trend: string;
  icon: any;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-green-600 mt-1">{trend}</p>
        </div>
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>
    </motion.div>
  );
};