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
    // Dog Courses
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
      id: "dog-advanced",
      title: "Advanced Dog Commands",
      description: "Complex tricks and commands for well-trained dogs",
      petType: "dog",
      progress: 0,
      duration: "4 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "heel",
          title: "Perfect Heel Walking",
          content: "Start with your dog on your left side. Hold treats at your waist level. Begin walking slowly, saying 'Heel'. If your dog pulls ahead or lags behind, stop immediately and call them back to position. Reward when they're in the correct position beside your leg. Practice in short 5-minute sessions, gradually increasing duration and adding distractions.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "roll-over",
          title: "Roll Over Trick",
          content: "Start with your dog in a 'down' position. Hold a treat close to their nose, then slowly move it from their nose towards their shoulder, over their back. Their body should naturally follow the treat and roll over. Say 'Roll over!' as they complete the motion. This trick requires patience and flexibility from your dog - practice on soft surfaces.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "fetch-specific",
          title: "Fetch Specific Items",
          content: "Start by teaching your dog the names of different toys. Hold up a specific toy, say its name clearly, and reward when they show interest. Gradually progress to having multiple toys available and asking for a specific one. 'Bring me the ball!' Practice with 2-3 different named items initially, then expand their vocabulary.",
          duration: "35 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-leash",
      title: "Leash Training Mastery",
      description: "Perfect leash walking and outdoor behavior",
      petType: "dog",
      progress: 10,
      duration: "3 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "leash-intro",
          title: "Leash Introduction",
          content: "Let your dog get comfortable with wearing a collar and leash indoors first. Allow them to drag the leash around the house under supervision. Reward calm behavior while wearing the leash. Once comfortable, hold the leash loosely and walk around your home, rewarding when they walk calmly beside you.",
          duration: "20 min",
          completed: true,
        },
        {
          id: "loose-leash",
          title: "Loose Leash Walking",
          content: "The key is to never allow pulling to be rewarded. When your dog pulls, immediately stop walking or change direction. Only move forward when the leash is loose. Reward frequently when your dog is walking nicely beside you. Use high-value treats and praise consistently. Practice in low-distraction environments first.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "distractions",
          title: "Walking Past Distractions",
          content: "Practice walking past common distractions like other dogs, people, cars, and squirrels. Start at a distance where your dog notices but doesn't react strongly. Reward attention to you instead of the distraction. Gradually decrease distance to distractions as your dog improves. Use the 'watch me' command to maintain focus.",
          duration: "25 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-social",
      title: "Dog Socialization",
      description: "Building confidence and social skills with other dogs and people",
      petType: "dog",
      progress: 0,
      duration: "6 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "puppy-socialization",
          title: "Early Puppy Socialization",
          content: "Expose your puppy to various sights, sounds, textures, and experiences during their critical socialization period (3-14 weeks). Carry young puppies to different environments before they're fully vaccinated. Positive experiences during this time shape their adult behavior. Keep experiences positive and never force interactions.",
          duration: "45 min",
          completed: false,
        },
        {
          id: "dog-greetings",
          title: "Proper Dog Greetings",
          content: "Teach your dog to greet other dogs calmly. Start with well-socialized, calm dogs. Keep initial meetings short and positive. Allow dogs to see each other from a distance first, then gradually close the gap. Reward calm, relaxed body language. End interactions before excitement gets too high.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "people-greetings",
          title: "Greeting People Politely",
          content: "Train your dog to sit when meeting new people instead of jumping. Ask visitors to ignore your dog until they sit, then reward with attention and treats. Practice the 'four paws on floor' rule - no attention unless all paws are down. Teach children how to properly greet your dog as well.",
          duration: "25 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-agility",
      title: "Dog Agility Basics",
      description: "Fun agility exercises and obstacle training",
      petType: "dog",
      progress: 0,
      duration: "8 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "jump-training",
          title: "Basic Jump Training",
          content: "Start with a very low jump or even a broomstick on the ground. Lead your dog over the obstacle with a treat, saying 'Jump!' or 'Over!' Gradually raise the height as they become comfortable. Never force jumping - let them step over at first. Make it fun and rewarding every time they successfully navigate the obstacle.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "tunnel-training",
          title: "Tunnel Confidence",
          content: "Start with a short, wide tunnel or even a large cardboard box with both ends open. Have someone hold your dog at one end while you call them through from the other side. Use exciting voice and treats to encourage them through. Gradually progress to longer, more curved tunnels as confidence builds.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "weave-poles",
          title: "Weave Pole Introduction",
          content: "Set up 6 weave poles in a straight line. Start by walking your dog through the poles on leash, guiding them in a weaving pattern. Use treats to lure them through the correct path. Practice the weaving motion slowly at first, then gradually increase speed. This exercise improves coordination and focus.",
          duration: "30 min",
          completed: false,
        },
      ],
    },

    // Cat Courses
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
    {
      id: "cat-tricks",
      title: "Cat Tricks & Commands",
      description: "Teaching your cat fun tricks and basic commands",
      petType: "cat",
      progress: 0,
      duration: "4 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "sit-cat",
          title: "Teaching Cat to Sit",
          content: "Hold a treat above your cat's head and slowly move it backwards over their head. As their head follows the treat, their bottom will naturally lower. The moment they sit, say 'Sit!' and give the treat immediately. Cats learn differently than dogs - keep sessions very short (2-3 minutes) and always end positively.",
          duration: "10 min",
          completed: false,
        },
        {
          id: "high-five",
          title: "High Five Trick",
          content: "Start with your cat in a sitting position. Hold a treat in your closed fist near their face. Wait for them to paw at your hand, then say 'High five!' and reward immediately. Gradually transition to an open palm gesture. Practice consistently but keep sessions short to maintain your cat's interest.",
          duration: "12 min",
          completed: false,
        },
        {
          id: "come-when-called",
          title: "Coming When Called",
          content: "Start training in a small, enclosed room. Use your cat's name followed by 'Come!' in a pleasant voice. Shake a treat bag or use a clicker to get their attention. When they approach, reward immediately with treats and praise. Practice during meal times when motivation is highest. Never call your cat to come for something unpleasant.",
          duration: "15 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-enrichment",
      title: "Indoor Cat Enrichment",
      description: "Keeping indoor cats happy, active and mentally stimulated",
      petType: "cat",
      progress: 20,
      duration: "3 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "puzzle-feeders",
          title: "Food Puzzle Introduction",
          content: "Replace regular food bowls with puzzle feeders to simulate hunting behavior. Start with simple puzzles and gradually increase difficulty. Hide small portions of food around the house to encourage foraging. Use treat-dispensing toys during play sessions. This mental stimulation helps prevent behavioral problems and keeps cats engaged.",
          duration: "15 min",
          completed: true,
        },
        {
          id: "vertical-space",
          title: "Creating Vertical Territory",
          content: "Install cat trees, shelves, and perches at different heights. Cats feel more secure when they can survey their territory from above. Provide multiple pathways between high spots. Consider window perches for bird watching. Vertical space is especially important in multi-cat households to reduce territorial conflicts.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "interactive-play",
          title: "Interactive Play Sessions",
          content: "Schedule 2-3 play sessions daily using wand toys that mimic prey movement. Move toys away from your cat to trigger chase instincts. Allow your cat to 'catch' the toy occasionally. End play sessions with a small meal to simulate the hunt-catch-eat cycle. Rotate toys weekly to maintain interest.",
          duration: "18 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-health",
      title: "Cat Health & Grooming",
      description: "Essential health care and grooming techniques for cats",
      petType: "cat",
      progress: 0,
      duration: "2 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "brushing-basics",
          title: "Regular Brushing Routine",
          content: "Start with short brushing sessions (2-3 minutes) using a soft brush. Brush in the direction of fur growth, paying attention to areas that mat easily like behind ears and under arms. For long-haired cats, brush daily; short-haired cats need brushing 2-3 times weekly. Make brushing positive with treats and praise.",
          duration: "12 min",
          completed: false,
        },
        {
          id: "nail-trimming",
          title: "Safe Nail Trimming",
          content: "Get your cat used to having their paws handled first. Press gently on paw pads to extend claws. Only trim the sharp, white tips - avoid the pink quick. Use proper cat nail clippers and trim only when your cat is calm. Start with just one or two nails per session. Reward with treats immediately after.",
          duration: "15 min",
          completed: false,
        },
        {
          id: "dental-care",
          title: "Dental Health Basics",
          content: "Start dental care early by getting your cat used to mouth handling. Use finger brushes or gauze with cat toothpaste (never human toothpaste). Begin by just touching teeth and gums, gradually progressing to actual brushing. Provide dental treats and toys. Schedule regular veterinary dental checkups.",
          duration: "18 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-multi",
      title: "Multi-Cat Households",
      description: "Managing multiple cats and preventing conflicts",
      petType: "cat",
      progress: 0,
      duration: "5 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "cat-introduction",
          title: "Introducing New Cats",
          content: "Keep new cats separated initially in different rooms. Exchange scents by rubbing a towel on each cat and placing it near the other's food. Feed cats on opposite sides of a closed door. Allow visual contact through baby gates once they're calm with scent exchange. Supervise first direct meetings and keep them short.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "resource-management",
          title: "Managing Resources",
          content: "Follow the 'n+1' rule - provide one more resource than the number of cats (litter boxes, food stations, water sources). Place resources in different areas to reduce competition. Each cat should have access to resources without being cornered by other cats. Monitor feeding times to ensure all cats get adequate nutrition.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "conflict-resolution",
          title: "Resolving Cat Conflicts",
          content: "Identify triggers for conflicts such as competition for resources or territorial disputes. Separate cats during conflicts without punishment. Increase environmental enrichment to reduce stress. Use pheromone diffusers to promote calm behavior. Consult a veterinary behaviorist for persistent aggression issues.",
          duration: "30 min",
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
    
    // Update selected lesson state if it's the current lesson being toggled
    if (selectedLesson && selectedLesson.id === lessonId) {
      setSelectedLesson({
        ...selectedLesson,
        completed: !selectedLesson.completed
      });
    }
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
              <Button 
                variant="coral" 
                size="sm"
                onClick={() => setSelectedCourse(courses[0])}
              >
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