import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Clock, Award, BookOpen, Play } from "lucide-react";
import petLogo from "@/assets/pet-paradise-logo.png";
import happyDog from "@/assets/happy-dog.png";
import cuteCat from "@/assets/cute-cat.png";

interface Course {
  id: string;
  title: string;
  description: string;
  petType: "cat" | "dog";
  progress: number;
  duration: string;
  lessons: Lesson[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  completed: boolean;
  image?: string;
}

const TrainingPage = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const courses: Course[] = [
    {
      id: "dog-basic",
      title: "Basic Dog Training",
      description: "Essential commands and good behavior training for your dog",  
      petType: "dog",
      progress: 25,
      duration: "2 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "sit",
          title: "Teaching 'Sit' Command",
          content: "Start with your dog in a standing position. Hold a treat close to their nose, then slowly lift the treat over their head. As their head follows the treat, their bottom will naturally lower to the ground. The moment they sit, say 'Sit!' clearly and give them the treat along with praise. Repeat this 5-10 times per session, practicing 2-3 times daily. Be patient and consistent - most dogs learn this command within a few days.",
          duration: "15 min",
          completed: true,
        },
        {
          id: "stay",
          title: "Teaching 'Stay' Command", 
          content: "Begin with your dog in the 'sit' position. Hold your hand up in a 'stop' gesture and take one small step back. If they stay for even 2-3 seconds, immediately return to them, say 'Good stay!' and reward with a treat. Gradually increase the distance and duration. Start with 5 seconds, then build up to 30 seconds or more. Practice this command in different locations to reinforce the behavior.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "come",
          title: "Recall Training",
          content: "Start in a secure, enclosed area. Kneel down and call your dog's name followed by 'Come!' in an excited, happy voice. When they come to you, reward immediately with treats and enthusiastic praise. Never call your dog to come for something they perceive as negative. Practice this daily, gradually increasing distance. Use a long training leash for safety during outdoor practice sessions.",
          duration: "25 min", 
          completed: false,
        },
      ],
    },
    {
      id: "cat-basics",
      title: "Cat Behavior & Care",
      description: "Understanding your cat's behavior and essential care tips",
      petType: "cat", 
      progress: 60,
      duration: "1 week",
      difficulty: "Beginner",
      lessons: [
        {
          id: "litter-training",
          title: "Litter Box Training",
          content: "Choose the right litter box - it should be large enough for your cat to move around comfortably. Place it in a quiet, accessible location away from food and water. Use unscented, clumping litter initially. Show your cat the box by gently placing them inside after meals or naps. Keep the box clean by scooping daily and changing litter weekly. If accidents happen, clean the area thoroughly with enzyme cleaner to remove odors.",
          duration: "10 min",
          completed: true,
        },
        {
          id: "scratching",
          title: "Proper Scratching Habits",
          content: "Provide multiple scratching posts of different materials (sisal, carpet, cardboard) and orientations (vertical and horizontal). Place posts near your cat's favorite resting spots and near entrances. When you catch your cat scratching appropriately, reward with treats and praise. If they scratch furniture, gently redirect them to the scratching post. Never punish - instead, make the inappropriate surfaces less appealing with double-sided tape or aluminum foil.",
          duration: "15 min",
          completed: true,
        },
        {
          id: "socialization",
          title: "Socialization Tips",
          content: "Start slowly with new experiences, people, and environments. Allow your cat to approach at their own pace - never force interactions. Create positive associations by offering treats during new experiences. Provide hiding spots and high perches where your cat feels safe. Handle your cat gently and regularly to get them used to touch. Introduce new people gradually, letting them offer treats to build positive associations.",
          duration: "20 min",
          completed: false,
        },
      ],
    },
  ];

  const goBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedLesson(null);
  };

  const goBackToLessons = () => {
    setSelectedLesson(null);
  };

  const toggleLessonComplete = (lessonId: string) => {
    if (!selectedCourse) return;
    
    const updatedCourse = {
      ...selectedCourse,
      lessons: selectedCourse.lessons.map(lesson =>
        lesson.id === lessonId 
          ? { ...lesson, completed: !lesson.completed }
          : lesson
      )
    };
    setSelectedCourse(updatedCourse);
  };

  // Render individual lesson view
  if (selectedLesson && selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 to-blue-50/30 pb-20">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={goBackToLessons}>
                ← Back
              </Button>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-foreground truncate">
                  {selectedLesson.title}
                </h1>
                <Badge variant="secondary" className="text-xs">
                  {selectedLesson.duration}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {selectedLesson.content}
                </p>
              </div>
              
              <div className="flex space-x-3 mt-6 pt-6 border-t">
                <Button
                  variant={selectedLesson.completed ? "secondary" : "coral"}
                  className="flex-1"
                  onClick={() => toggleLessonComplete(selectedLesson.id)}
                >
                  {selectedLesson.completed ? (
                    <>
                      <Award size={18} />
                      Completed
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      Mark Complete
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render course lessons view
  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 to-blue-50/30 pb-20">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={goBackToCourses}>
                ← Courses
              </Button>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-foreground">
                  {selectedCourse.title}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Progress value={selectedCourse.progress} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground">
                    {selectedCourse.progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6 space-y-4">
          {selectedCourse.lessons.map((lesson, index) => (
            <Card 
              key={lesson.id} 
              className="border-0 shadow-soft cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedLesson(lesson)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      lesson.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {lesson.completed ? (
                        <Award size={16} />
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{lesson.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock size={14} />
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Render main courses view
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 to-blue-50/30 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <img src={petLogo} alt="Pet Paradise" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Pet Training</h1>
              <Badge variant="secondary" className="text-xs">Learn & Grow</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Featured Course */}
        <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Award className="text-primary" size={24} />
              <div>
                <h2 className="font-semibold text-lg">Daily Recommend</h2>
                <p className="text-sm text-muted-foreground">Good Behavior Training</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-lg">0%</span>
                </div>
              </div>
              <Button variant="coral" size="sm">
                Start Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Course Categories */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Training Courses</h3>
          
          {courses.map((course) => (
            <Card 
              key={course.id}
              className="border-0 shadow-soft cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedCourse(course)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <img 
                      src={course.petType === "dog" ? happyDog : cuteCat} 
                      alt={course.petType} 
                      className="w-10 h-10"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{course.title}</h4>
                      <ChevronRight size={20} className="text-muted-foreground" />
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="text-xs">
                          {course.difficulty}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock size={12} />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={course.progress} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {course.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Tips */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Quick Training Tips</h3>
            <div className="space-y-3">
              {[
                { tip: "Keep training sessions short (5-15 minutes)", icon: "⏰" },
                { tip: "Always end on a positive note", icon: "✨" },
                { tip: "Be consistent with commands", icon: "🎯" },
                { tip: "Reward immediately after good behavior", icon: "🎉" },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-sm text-foreground">{item.tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingPage;