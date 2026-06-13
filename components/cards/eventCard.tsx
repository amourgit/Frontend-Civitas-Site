import React, { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    Users,
    TrendingUp,
    MessageSquare,
    Share2,
    Clock,
    MapPin,
    Calendar,
    Trophy,
    Heart,
    CheckCircle,
    MessageCircle,
    Bookmark,
} from "lucide-react";

// Composant pour les statistiques avant l'événement
const BeforeEventStats = ({ event }: { event: any }) => {
    const registrationChannels = [
        { name: "Site Web", value: 45, color: "#3b82f6" },
        { name: "Réseaux Sociaux", value: 30, color: "#8b5cf6" },
        { name: "Guichet", value: 15, color: "#ec4899" },
        { name: "Partenariats", value: 10, color: "#10b981" },
    ];

    const interestData = [
        { name: "Intéressés", value: event.interestedCount || 450 },
        { name: "Inscrits", value: event.registeredCount || 280 },
    ];

    const conversionRate = (
        ((event.registeredCount || 280) / (event.interestedCount || 450)) *
        100
    ).toFixed(1);

    return (
        <div className="flex gap-2 w-full">
            {/* Stat 1: Inscriptions */}
            <div className="flex-1 flex flex-col items-center">
                <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-lg font-bold text-white">
                        {event.registeredCount || 280}
                    </span>
                    <span className="text-white/50 text-[0.6rem]">
                        / {event.expectedParticipants || 500}
                    </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-0.5 mb-1">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-0.5 rounded-full transition-all duration-500"
                        style={{
                            width: `${((event.registeredCount || 280) /
                                    (event.expectedParticipants || 500)) *
                                100
                                }%`,
                        }}
                    />
                </div>
                <p className="text-white/50 text-[0.55rem]">Inscriptions</p>
            </div>

            {/* Stat 2: Canaux d'inscription */}
            <div className="flex-1 flex flex-col items-center">
                <div className="h-12 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={registrationChannels}
                                cx="50%"
                                cy="50%"
                                innerRadius={12}
                                outerRadius={20}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {registrationChannels.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-white/50 text-[0.55rem] mt-1">Canaux</p>
            </div>

            {/* Stat 3: Taux d'intérêt */}
            <div className="flex-1 flex flex-col items-center">
                <div className="h-12 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={interestData}>
                            <Bar dataKey="value" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-green-400 font-bold text-xs mt-1">
                    {conversionRate}%
                </p>
            </div>
        </div>
    );
};

// Composant pour les statistiques pendant l'événement
const DuringEventStats = ({ event }: { event: any }) => {
    const attendanceData = [
        { time: "9h", value: 45 },
        { time: "10h", value: 120 },
        { time: "11h", value: 230 },
        { time: "12h", value: 280 },
        { time: "13h", value: 265 },
    ];

    const engagementData = [
        { name: "Questions", value: 42 },
        { name: "Interactions", value: 156 },
        { name: "Partages", value: 89 },
    ];

    const currentAttendance = event.currentAttendance || 265;
    const attendanceRate = (
        (currentAttendance / (event.registeredCount || 280)) *
        100
    ).toFixed(1);

    return (
        <div className="flex gap-2 w-full">
            {/* Stat 1: Présence en temps réel */}
            <div className="flex-1 flex flex-col items-center">
                <div className="h-12 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={attendanceData}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#10b981"
                                strokeWidth={1.5}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-bold text-white">{currentAttendance}</p>
                    <p className="text-xs font-bold text-green-400">{attendanceRate}%</p>
                </div>
            </div>

            {/* Stat 2: Engagement en direct */}
            <div className="flex-1 flex flex-col items-center">
                <div className="h-12 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={engagementData} layout="vertical">
                            <Bar dataKey="value" fill="#3b82f6" radius={[0, 3, 3, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-white/50 text-[0.55rem] mt-1">Engagement</p>
            </div>

            {/* Stat 3: Satisfaction instantanée */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-yellow-400">4.7</div>
                <div className="w-full space-y-0.5 mt-1">
                    {[5, 4, 3].map((star) => (
                        <div key={star} className="flex items-center gap-1">
                            <div className="flex-1 bg-white/10 rounded-full h-0.5">
                                <div
                                    className="bg-yellow-400 h-0.5 rounded-full"
                                    style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : 8}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Composant pour les statistiques après l'événement
const AfterEventStats = ({ event }: { event: any }) => {
    const feedbackData = [
        { category: "Excellent", value: 65, color: "#10b981" },
        { category: "Bon", value: 25, color: "#3b82f6" },
        { category: "Moyen", value: 8, color: "#f59e0b" },
        { category: "Faible", value: 2, color: "#ef4444" },
    ];

    const impactData = [
        { metric: "Partages", before: 45, after: 189 },
        { metric: "Mentions", before: 23, after: 156 },
    ];

    const conversionData = [
        { name: "Participants", value: event.actualParticipants || 265 },
        { name: "Leads", value: event.leadsGenerated || 87 },
        { name: "Conversions", value: event.conversions || 23 },
    ];

    return (
        <div className="flex flex-row gap-2 w-[100%] max-w-[200px] justify-start items-center mt-2">
            {/* Stat 1: Feedback global */}
            <div className="flex-1 flex flex-col items-center">
                <div className="h-12 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={feedbackData}
                                cx="50%"
                                cy="50%"
                                innerRadius={12}
                                outerRadius={20}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {feedbackData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-white/50 text-[0.55rem] mt-1">Feedback</p>
            </div>

            {/* Stat 2: Impact social */}
            <div className="flex-1 flex flex-col items-center">
                <div className="h-12 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={impactData}>
                            <Bar dataKey="before" fill="#6b7280" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="after" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-white/50 text-[0.55rem] mt-1">Impact</p>
            </div>

            {/* Stat 3: ROI et conversions */}
            <div className="flex-1 flex flex-col items-center">
                <div className="h-12 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={conversionData}>
                            <Bar dataKey="value" fill="#10b981" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-green-400 font-bold text-xs mt-1">
                    {(
                        ((event.conversions || 23) / (event.actualParticipants || 265)) *
                        100
                    ).toFixed(1)}
                    %
                </p>
            </div>
        </div>
    );
};

// Composant principal EventCard
export const EventCard = ({ event }: { event: any }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [currentStatGroup, setCurrentStatGroup] = useState(0);
    const [, forceUpdate] = useState(0);

    // Vérifier la phase de l'événement basée sur les dates
    useEffect(() => {
        const checkEventPhase = () => {
            const now = new Date();
            const startDate = new Date(`${event.dateDebut}T${event.heureDebut}`);
            const endDate = new Date(`${event.dateFin}T${event.heureFin}`);

            if (now < startDate) {
                setCurrentStatGroup(0); // Avant l'événement
            } else if (now >= startDate && now <= endDate) {
                setCurrentStatGroup(1); // Pendant l'événement
            } else {
                setCurrentStatGroup(2); // Après l'événement
            }
        };

        checkEventPhase();
        const interval = setInterval(() => {
            checkEventPhase();
            forceUpdate((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [event.dateDebut, event.heureDebut, event.dateFin, event.heureFin]);

    const featuredProfiles = [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    ];
    // fonction utilitaire : retourne des offsets { right, bottom } en px
    const getArcPosition = (index: number, total: number, radius = 84) => {
        // arc couvrant de -90° (up) à -180° (left) => arc d'environ 90°
        const startAngle = -90;    // vertical up (au-dessus du coin)
        const endAngle = -180;     // gauche
        const angleStep = total > 1 ? (endAngle - startAngle) / (total - 1) : 0;
        const angle = startAngle + index * angleStep;

        const rad = (angle * Math.PI) / 180;

        // cos => déplacement horizontal (négatif = gauche), sin => déplacement vertical (négatif = up)
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;

        return {
            right: Math.abs(Math.round(x)),   // px depuis la droite
            bottom: Math.abs(Math.round(y)),  // px depuis le bas
        };
    };


    const actionButtons = [
        { icon: Heart, count: 124, label: "Like" },
        { icon: MessageCircle, count: 45, label: "Comment" },
        { icon: Share2, count: 32, label: "Share" }
    ];
    const description =
        event.description ||
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

    const statGroups = [
        "Avant événement",
        "Pendant événement",
        "Après événement",
    ];

    return (
        <div
            className="relative flex flex-col w-full min-h-[300px] rounded-lg overflow-hidden cursor-pointer group transition-all"
            style={{
                backgroundImage: `url(${event.thumbnail})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />

            {/* Contenu */}
            <div className="relative z-10 flex flex-col justify-between h-full py-6 px-6 gap-4">
                {/* Section supérieure : Titre et Description */}
                <div className="space-y-3">
                    <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-white/90 transition-colors">
                        {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/80 text-sm leading-relaxed">
                        {showFullDescription
                            ? description
                            : `${description.substring(0, 100)}...`}
                        {description.length > 100 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowFullDescription(!showFullDescription);
                                }}
                                className="text-blue-400 hover:text-blue-300 ml-2 uppercase text-xs font-medium transition-colors"
                            >
                                {showFullDescription ? "Voir moins" : "Voir plus"}
                            </button>
                        )}
                    </p>
                </div>

                {/* Section inférieure : Informations et Stats */}
                <div className="flex flex-col gap-4">
                    {/* Informations de l'événement */}
                    <div className="flex flex-col gap-2 text-white/70 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{event.dateDebut}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                                {event.heureDebut} - {event.heureFin}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.lieu || "Lieu à confirmer"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{event.expectedParticipants || 500} participants max</span>
                        </div>
                    </div>

                    {/* Section Statistiques */}
                    <div className="w-full">
                        <AfterEventStats event={event} />
                    </div>

                    {/* Profils mis en avant */}
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {featuredProfiles.map((profile, i) => (
                                <div
                                    key={i}
                                    className="w-9 h-9 rounded-full border-2 border-gray-900 overflow-hidden transition-transform hover:scale-110 hover:z-10"
                                >
                                    <img
                                        src={profile}
                                        alt={`Featured ${i + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                        <span className="text-white text-xs font-medium bg-blue-500 px-3 py-1 rounded-full">
                            +{Math.floor(Math.random() * 50 + 10)}
                        </span>
                    </div>
                </div>
            </div>


            {/* Boutons d'action en arc de cercle - Bas droite */}
            <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
                {actionButtons.map((button, index) => {
                    const { right, bottom } = getArcPosition(index, actionButtons.length, 45); // ajuste radius ici
                    const Icon = button.icon;

                    return (
                        <button
                            key={button.label}
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log(`${button.label} clicked`);
                            }}
                            // position absolute par bouton, basé sur offsets depuis bottom-right
                            className="absolute flex flex-col items-center gap-1 transition-transform hover:scale-110"
                            style={{
                                right: `${right}px`,
                                bottom: `${bottom-10}px`,
                                // margin: "10px",
                                // assure que chaque bouton soit au-dessus du fond et clique possible
                                pointerEvents: 'auto',
                            }}
                            title={button.label}
                            aria-label={button.label}
                        >
                            <div className="relative">
                                <div className="bg-white/12 backdrop-blur-md rounded-full p-2 hover:bg-white/20 transition-colors shadow-lg">
                                    <Icon className="h-4 w-4 text-white" />
                                </div>

                                {/* Badge de quantité placé en haut à droite de l'icône */}
                                <span className="absolute -top-2 -right-0 bg-blue-600 text-white text-[10px] font-semibold rounded-full px-2 py-[2px] shadow-md">
                                    {button.count}
                                </span>
                            </div>

                            {/* label (optionnel) — réduit la taille pour éviter collision */}
                            <span className="text-white text-[11px] font-semibold drop-shadow-lg mt-1 select-none">
                                {/* si tu préfères cacher le label, commente la ligne suivante */}
                                {/* button.label */}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
