import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, BookOpen, Star, TrendingUp, Calendar } from 'lucide-react';

export interface Course {
    id: string;
    title: string;
    shortDescription: string;
    category: string;
    subCategory: string;
    imageUrl: string;
    instructorId: string;
    instructorName: string;
    instructorImage?: string;
    difficulty: 'Başlangıç' | 'Orta' | 'İleri';
    duration: number;
    language: string;
    startDate: Date | string;
    endDate: Date | string;
    maxStudents: number;
    enrolledCount: number;
    price: number;
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
    rating?: number;
    reviewCount?: number;
    createdAt?: any;
}

interface CourseCardProps {
    course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    // Format date
    const formattedStartDate = new Date(course.startDate).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Difficulty colors
    const difficultyColors = {
        'Başlangıç': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Orta': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'İleri': 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    // Progress percentage
    const enrollmentPercentage = (course.enrolledCount / course.maxStudents) * 100;

    return (
        <Link href={`/kurslar/${course.id}`} className="group block h-full">
            <div className="glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-glow-lg flex flex-col h-full transform hover:scale-[1.02] hover:-translate-y-1 bg-card border-border">

                {/* Image Section - Modified for Horizontal/Landscape Format */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {course.imageUrl ? (
                        <>
                            <Image
                                src={course.imageUrl}
                                alt={course.title}
                                fill
                                className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                                unoptimized
                            />
                            {/* Gradient Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                            <BookOpen className="w-12 h-12 mb-2 opacity-50" />
                            <span className="text-xs font-medium uppercase tracking-wider opacity-70">Görsel Yok</span>
                        </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 glass-strong text-foreground text-xs font-medium rounded-full border border-border backdrop-blur-md">
                            {course.subCategory || course.category}
                        </span>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border backdrop-blur-md ${difficultyColors[course.difficulty]}`}>
                            {course.difficulty}
                        </span>
                    </div>

                    {/* Rating Badge (Bottom Left) */}
                    {course.rating && (
                        <div className="absolute bottom-4 left-4 flex items-center gap-1 glass-strong px-2 py-1 rounded-lg backdrop-blur-md">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-foreground">{course.rating.toFixed(1)}</span>
                            {course.reviewCount && (
                                <span className="text-xs text-muted-foreground ml-1">({course.reviewCount})</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-3 flex flex-col flex-grow">
                    <h3 className="text-base font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {course.title}
                    </h3>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {course.shortDescription}
                    </p>

                    {/* Instructor */}
                    <div className="flex items-center gap-1.5 mb-3">
                        {course.instructorImage ? (
                            <Image
                                src={course.instructorImage}
                                alt={course.instructorName}
                                width={18}
                                height={18}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                {course.instructorName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-xs text-muted-foreground">{course.instructorName}</span>
                    </div>

                    {/* Info Row */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center text-muted-foreground text-xs">
                            <Clock className="w-3 h-3 mr-1.5 text-primary flex-shrink-0" />
                            <span>{course.duration} saat</span>
                        </div>

                        <div className="flex items-center text-muted-foreground text-xs">
                            <Calendar className="w-3 h-3 mr-1.5 text-primary flex-shrink-0" />
                            <span className="line-clamp-1 text-xs">{formattedStartDate}</span>
                        </div>
                    </div>

                    {/* Enrollment Progress */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{course.enrolledCount} / {course.maxStudents} öğrenci</span>
                            </div>
                            {enrollmentPercentage >= 80 && (
                                <span className="text-primary flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    Dolmak üzere!
                                </span>
                            )}
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                                style={{ width: `${enrollmentPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Footer / Price */}
                    <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Kurs Ücreti</span>
                            <span className="text-primary font-bold text-base">
                                {course.price > 0 ? `₺${course.price}` : 'Ücretsiz'}
                            </span>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-primary text-black font-medium text-xs group-hover:bg-primary/90 transition-all duration-300 group-hover:scale-105">
                            Detayları Gör
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;
