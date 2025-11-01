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
  const [petFilter, setPetFilter] = useState<"dog" | "cat">("dog");

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
    {
      id: "dog-puppy",
      title: "Puppy Foundation Program",
      description: "Comprehensive early training for puppies 8-16 weeks old",
      petType: "dog",
      progress: 0,
      duration: "6 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "potty-training",
          title: "House Training Fundamentals",
          content: "Establish a consistent routine for feeding, watering, and potty breaks. Take your puppy outside every 2 hours and immediately after meals, naps, and play. Choose a designated potty spot and use a command like 'Go potty!' Reward immediately when they eliminate outside. Clean accidents indoors with enzyme cleaner to remove scent markers.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "bite-inhibition",
          title: "Teaching Bite Inhibition",
          content: "When your puppy bites during play, let out a high-pitched yelp and stop playing immediately. This mimics how littermates would react. Redirect biting to appropriate toys. Never use your hands as toys. If biting continues, remove yourself from the situation for a brief timeout. Consistency is key for all family members.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "crate-training",
          title: "Positive Crate Training",
          content: "Make the crate a positive space by feeding meals inside and placing favorite toys there. Start with short periods with the door open, gradually increasing time. Never use the crate as punishment. Cover the crate with a blanket to create a den-like atmosphere. Practice crate training during the day before using for overnight sleep.",
          duration: "30 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-senior",
      title: "Senior Dog Care & Training",
      description: "Specialized training and care for older dogs",
      petType: "dog",
      progress: 0,
      duration: "4 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "cognitive-exercises",
          title: "Mental Stimulation for Seniors",
          content: "Keep senior minds sharp with puzzle toys, scent work, and new trick training. Rotate toys weekly to maintain interest. Hide treats around the house for gentle foraging activities. Teach new commands slowly and patiently. Mental exercise is as important as physical exercise for senior dogs.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "mobility-management",
          title: "Managing Reduced Mobility",
          content: "Adjust exercise routines to shorter, more frequent walks. Provide ramps or steps to help with stairs and furniture. Consider orthopedic bedding for joint comfort. Gentle stretching exercises can help maintain flexibility. Watch for signs of pain and consult your veterinarian for pain management options.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "routine-adaptation",
          title: "Adapting to Changing Needs",
          content: "Senior dogs thrive on routine but may need adjustments. Provide more frequent bathroom breaks. Adjust feeding schedules if needed. Be patient with slower responses to commands. Create comfortable, easily accessible sleeping areas. Monitor for changes in behavior that might indicate health issues.",
          duration: "18 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-protection",
      title: "Personal Protection Training",
      description: "Training dogs for home security and family protection",
      petType: "dog",
      progress: 0,
      duration: "8 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "alert-training",
          title: "Controlled Alert Behavior",
          content: "Teach your dog to alert you to strangers without excessive barking. Use the 'Watch' command to direct attention to specific areas or people. Reward calm, controlled alerting behavior. Practice the 'Quiet' command to stop barking on cue. Train in various scenarios and locations for reliability.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "boundary-protection",
          title: "Property Boundary Training",
          content: "Establish clear boundaries your dog should patrol and protect. Use positive reinforcement to reward appropriate protective behavior. Train the difference between welcome guests and potential threats. Practice recall commands even when your dog is in 'protection mode' for safety and control.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "controlled-aggression",
          title: "Controlled Protection Response",
          content: "This advanced training should only be done with professional guidance. Focus on impulse control and stopping protection behavior on command. Practice scenarios with helpers wearing protective gear. Emphasize the importance of discrimination between real threats and normal situations.",
          duration: "45 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-search",
      title: "Search & Rescue Basics",
      description: "Introduction to search and rescue training techniques",
      petType: "dog",
      progress: 0,
      duration: "10 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "scent-discrimination",
          title: "Basic Scent Work",
          content: "Start with simple scent discrimination using cotton swabs with different scents. Reward your dog for identifying the target scent. Progress to hiding scented items for your dog to find. Use consistent rewards and verbal markers. Build from easy finds to more challenging searches gradually.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "area-search",
          title: "Area Search Techniques",
          content: "Teach systematic area searching using grid patterns. Start in small, enclosed areas before progressing to larger spaces. Use wind direction awareness in training. Practice both on-leash and off-leash searching depending on the situation. Reward thorough, methodical searching behavior.",
          duration: "45 min",
          completed: false,
        },
        {
          id: "human-scent",
          title: "Human Scent Tracking",
          content: "Begin with fresh tracks made by familiar people. Start with straight-line tracks before adding turns. Use scent articles to give your dog the target scent. Gradually increase track age and complexity. Weather conditions and terrain will affect scent trails - practice in various conditions.",
          duration: "50 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-competition",
      title: "Competition Obedience",
      description: "Precision training for obedience competitions",
      petType: "dog",
      progress: 0,
      duration: "12 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "precision-heeling",
          title: "Competition Heeling",
          content: "Perfect heel position requires your dog's shoulder aligned with your left leg. Practice automatic sits when you halt. Work on maintaining position through pace changes, turns, and figure-8 patterns. Use minimal verbal cues and hand signals. Train for sustained attention and precise positioning.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "formal-retrieve",
          title: "Formal Retrieve Training",
          content: "Train the complete retrieve sequence: wait for command, go out quickly, pick up dumbbell properly, return directly, sit straight in front, hold until command to release. Practice with different objects and surfaces. Work on gentle mouth pressure and proper holding technique.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "directed-jumping",
          title: "Directed Jumping",
          content: "Teach your dog to go away from you to a designated spot, turn and sit facing you, then jump over the indicated jump when directed. Start with short distances and low jumps. Build reliability with directional commands and hand signals. Practice discrimination between different jumps.",
          duration: "45 min",
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
    {
      id: "cat-travel",
      title: "Traveling with Your Cat",
      description: "Prepare your cat for car rides and travel adventures",
      petType: "cat",
      progress: 0,
      duration: "4 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "carrier-training",
          title: "Carrier Comfort Training",
          content: "Leave carrier out in your home with door open as a normal piece of furniture. Place soft bedding and treats inside. Feed meals near or inside carrier. Spray with calming pheromones. Gradually close door for short periods while rewarding calm behavior.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "car-ride-basics",
          title: "First Car Rides",
          content: "Start with engine off, then engine on without moving. Progress to short drives around the block. Always secure carrier with seatbelt. Cover carrier partially for security. Take practice trips to positive destinations, not just the vet.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "travel-essentials",
          title: "Long Distance Travel Prep",
          content: "Pack familiar items including favorite blanket, toys, and litter. Bring portable litter box and food. Never leave cat alone in vehicle. Plan rest stops for longer journeys. Keep updated ID tags and microchip info.",
          duration: "18 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-clicker",
      title: "Clicker Training for Cats",
      description: "Advanced training using clicker methods for felines",
      petType: "cat",
      progress: 0,
      duration: "3 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "clicker-intro-cat",
          title: "Clicker Introduction",
          content: "Charge the clicker by clicking and immediately offering a treat. Repeat 10-15 times. Keep sessions under 3 minutes. The click marks exact moment of desired behavior. Timing is critical for success.",
          duration: "10 min",
          completed: false,
        },
        {
          id: "target-training",
          title: "Target Stick Training",
          content: "Present target stick and click when cat touches it with nose or paw. Reward immediately. Gradually move target to guide cat to different locations. This forms foundation for complex tricks.",
          duration: "15 min",
          completed: false,
        },
        {
          id: "complex-behaviors",
          title: "Building Complex Behaviors",
          content: "Chain multiple behaviors together using clicker. Break down tricks into small steps. Click and reward each step. Examples: jumping through hoops, weaving between legs, or ringing bells.",
          duration: "20 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-hunting-redirect",
      title: "Redirecting Hunting Instincts",
      description: "Channel natural hunting behaviors appropriately",
      petType: "cat",
      progress: 0,
      duration: "2 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "prey-simulation",
          title: "Simulating the Hunt",
          content: "Use wand toys to mimic natural prey movements - mice, birds, insects. Move toys away from cat to trigger chase. Allow successful 'catches' occasionally. End play with small treat to complete hunt-catch-eat sequence.",
          duration: "15 min",
          completed: false,
        },
        {
          id: "play-aggression",
          title: "Managing Play Aggression",
          content: "Never use hands as toys. Redirect pouncing to appropriate toys. If cat becomes overstimulated during play, stop and walk away. Provide regular play sessions to burn energy and prevent ambush behavior.",
          duration: "18 min",
          completed: false,
        },
        {
          id: "outdoor-enrichment",
          title: "Safe Outdoor Experiences",
          content: "Consider catio or enclosed outdoor space. Train for harness and leash walking if desired. Supervise all outdoor time. Provide bird feeders near windows for indoor hunting entertainment.",
          duration: "22 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-senior",
      title: "Senior Cat Care & Comfort",
      description: "Specialized care for aging felines",
      petType: "cat",
      progress: 0,
      duration: "3 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "mobility-aids",
          title: "Helping with Reduced Mobility",
          content: "Add ramps or steps to favorite perches. Lower litter box sides for easier access. Provide multiple litter boxes on each floor. Use non-slip mats near food and litter areas. Consider heated beds for arthritic joints.",
          duration: "15 min",
          completed: false,
        },
        {
          id: "senior-health",
          title: "Monitoring Senior Health",
          content: "Watch for changes in appetite, water consumption, and litter box habits. Note increased vocalization or disorientation. Monitor weight regularly. Schedule senior wellness exams every 6 months. Discuss pain management with vet.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "comfort-care",
          title: "Enhancing Quality of Life",
          content: "Maintain predictable routines seniors find comforting. Keep food, water, and litter boxes easily accessible. Provide gentle grooming assistance. Continue play but adjust intensity. Give extra patience and affection.",
          duration: "16 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-aggression",
      title: "Cat Aggression Management",
      description: "Understanding and reducing aggressive behaviors",
      petType: "cat",
      progress: 0,
      duration: "5 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "aggression-types",
          title: "Identifying Aggression Types",
          content: "Learn to recognize different types: play aggression, fear aggression, territorial, redirected, and pain-induced. Understanding the cause is key to addressing the behavior. Watch for warning signs like dilated pupils, flattened ears, tail lashing.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "fear-based-aggression",
          title: "Addressing Fear-Based Aggression",
          content: "Never punish fearful aggression. Identify triggers and reduce exposure gradually. Create safe spaces and escape routes. Build positive associations with scary stimuli using treats. Never corner or force interaction with fearful cats.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "redirection-techniques",
          title: "Redirected Aggression Solutions",
          content: "Occurs when cat can't reach trigger (outdoor cat) and attacks nearby target. Separate cats immediately during episodes. Reintroduce gradually after calming. Address original trigger if possible. Use pheromone diffusers to reduce tension.",
          duration: "28 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-kitten",
      title: "Kitten Socialization Program",
      description: "Essential early training for kittens 8-16 weeks",
      petType: "cat",
      progress: 0,
      duration: "8 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "early-handling",
          title: "Positive Handling & Touch",
          content: "Handle kittens gently and frequently to build comfort with touch. Touch paws, ears, mouth regularly. Associate handling with treats. This prepares them for grooming and vet visits. Keep sessions short and positive.",
          duration: "12 min",
          completed: false,
        },
        {
          id: "environmental-exposure",
          title: "Environmental Socialization",
          content: "Expose kittens to various household sounds - vacuum, doorbell, TV, music. Introduce different textures, surfaces, and objects. Allow supervised exploration. Create positive associations with new experiences using play and treats.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "people-socialization",
          title: "Meeting New People",
          content: "Introduce kitten to people of different ages, genders, appearances. Let kitten approach at their pace. Have visitors offer treats. Positive early experiences prevent fearfulness. Handle gently and reward calm behavior.",
          duration: "18 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-anxiety",
      title: "Feline Anxiety & Stress Relief",
      description: "Helping anxious cats feel safe and secure",
      petType: "cat",
      progress: 0,
      duration: "4 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "stress-signals",
          title: "Recognizing Stress Signals",
          content: "Learn to identify stress signs: hiding, decreased appetite, over-grooming, inappropriate elimination, excessive vocalization. Understand that stressed cats need environmental changes, not punishment. Early intervention prevents escalation.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "safe-spaces",
          title: "Creating Safe Havens",
          content: "Provide multiple hiding spots throughout home. Use covered beds, boxes, cat trees with enclosed spaces. Ensure access to high perches for security. Never force cat out of hiding. Let them retreat when overwhelmed.",
          duration: "15 min",
          completed: false,
        },
        {
          id: "calming-techniques",
          title: "Anxiety Reduction Methods",
          content: "Use pheromone diffusers in main living areas. Maintain consistent routines. Provide environmental enrichment. Consider calming supplements after vet consultation. Practice desensitization to specific triggers gradually.",
          duration: "22 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-communication",
      title: "Understanding Cat Communication",
      description: "Decode your cat's body language and vocalizations",
      petType: "cat",
      progress: 0,
      duration: "2 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "body-language",
          title: "Reading Cat Body Language",
          content: "Learn what tail positions mean: straight up (happy), puffed (scared/aggressive), tucked (fearful). Ear positions: forward (alert/interested), flat (aggressive/fearful). Understand slow blinks as signs of trust and contentment.",
          duration: "16 min",
          completed: false,
        },
        {
          id: "vocalizations",
          title: "Interpreting Cat Sounds",
          content: "Meows are primarily for human communication. Purring usually indicates contentment but can signal pain. Hissing/growling are clear warnings. Chattering at windows indicates hunting instinct. Yowling may indicate distress or mating behavior.",
          duration: "18 min",
          completed: false,
        },
        {
          id: "scent-communication",
          title: "Scent Marking Behaviors",
          content: "Head bunting and cheek rubbing show affection and mark territory with facial pheromones. Scratching marks territory visually and with scent. Understand difference between territory marking and inappropriate elimination issues.",
          duration: "14 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-medical-training",
      title: "Medical Care Training for Cats",
      description: "Prepare your cat for vet visits and home health care",
      petType: "cat",
      progress: 0,
      duration: "4 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "vet-preparation",
          title: "Reducing Vet Visit Stress",
          content: "Desensitize to carrier with daily positive exposure. Take practice car rides to pleasant destinations. Ask vet for cat-only appointment times when possible. Use pheromone spray in carrier 30 minutes before trip.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "medication-administration",
          title: "Giving Medications Effectively",
          content: "Practice restraint techniques gently. Use pill pockets or treat wrapping for oral medications. Learn proper pilling technique - aim for back of tongue. For liquids, insert syringe at side of mouth. Always reward after medication.",
          duration: "22 min",
          completed: false,
        },
        {
          id: "home-health-checks",
          title: "Regular Home Health Monitoring",
          content: "Check teeth and gums weekly for redness or bad breath. Feel for lumps during petting. Monitor eating, drinking, elimination patterns. Weight check monthly. Early detection of changes allows prompt veterinary intervention.",
          duration: "18 min",
          completed: false,
        },
      ],
    },

    // Additional Dog Courses
    {
      id: "dog-puppy",
      title: "Puppy Training Essentials",
      description: "Complete puppy training program for 8-16 week old puppies",
      petType: "dog",
      progress: 0,
      duration: "12 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "puppy-schedule",
          title: "Establishing Routines",
          content: "Create consistent daily schedules for feeding, potty breaks, play, and sleep. Puppies thrive on routine and it helps with house training. Feed at the same times daily, take outside immediately after meals, naps, and play. Establish a bedtime routine with a comfortable sleeping area.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "bite-inhibition",
          title: "Bite Inhibition Training",
          content: "Teach your puppy to control their bite pressure during play. When puppy bites too hard, yelp loudly and stop playing immediately. Turn away and ignore them for 10-15 seconds. Resume play when they're calm. This teaches them that hard bites end fun interactions.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "crate-training",
          title: "Crate Training Basics",
          content: "Make the crate a positive space by feeding meals inside and placing comfortable bedding. Start with short periods with door open, gradually increase time and close door. Never use crate as punishment. Cover with blanket to create den-like atmosphere.",
          duration: "30 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-anxiety",
      title: "Dog Anxiety & Stress Management",
      description: "Help your dog overcome anxiety, fears, and stress-related behaviors",
      petType: "dog",
      progress: 0,
      duration: "6 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "separation-anxiety",
          title: "Separation Anxiety Solutions",
          content: "Start with very short departures (30 seconds) and gradually increase time. Don't make a big fuss when leaving or returning. Practice departure cues (keys, jacket) without actually leaving. Provide engaging toys and puzzles when alone. Consider calming supplements or pheromone diffusers.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "noise-phobias",
          title: "Overcoming Noise Fears",
          content: "Gradually desensitize your dog to scary sounds using recordings at low volume. Pair scary sounds with positive experiences like treats and play. Create a safe space where your dog can retreat during storms or fireworks. Never comfort fearful behavior as this can reinforce the fear.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "confidence-building",
          title: "Building Confidence",
          content: "Set up success scenarios where your dog can achieve small victories. Use positive reinforcement training methods. Expose to new experiences gradually and positively. Avoid forcing interactions - let your dog approach at their own pace. Build trust through consistent, patient training.",
          duration: "30 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-clicker",
      title: "Clicker Training Fundamentals",
      description: "Master precision timing with clicker training techniques",
      petType: "dog",
      progress: 0,
      duration: "4 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "clicker-introduction",
          title: "Introduction to Clicker",
          content: "Charge the clicker by clicking and immediately giving a treat. Repeat 15-20 times until your dog perks up at the click sound, expecting a reward. The click marks the exact moment of correct behavior. Time the click precisely when the behavior occurs, not after.",
          duration: "15 min",
          completed: false,
        },
        {
          id: "shaping-behaviors",
          title: "Shaping New Behaviors",
          content: "Break complex behaviors into small steps. Click and reward progress toward the final goal. For example, teaching 'spin' - click for head turn, then quarter turn, then half turn, until full spin. Be patient and let your dog figure it out.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "capturing-behaviors",
          title: "Capturing Natural Behaviors",
          content: "Watch for behaviors your dog does naturally and click the moment they happen. Common behaviors to capture: stretching (bow), yawning, spinning, or tilting head. Once captured several times, add a verbal cue just before the behavior occurs.",
          duration: "20 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-protection",
      title: "Guard Dog Training",
      description: "Basic protection and alert training for home security",
      petType: "dog",
      progress: 0,
      duration: "8 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "alert-training",
          title: "Controlled Alert Commands",
          content: "Teach your dog to bark on command with 'Alert' or 'Watch'. Start by saying the command when they naturally bark, then reward. Practice controlled barking - dog should bark when told and stop when told. This is foundation for protection training.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "perimeter-patrol",
          title: "Property Boundary Training",
          content: "Walk your property lines with your dog, teaching them the boundaries they should monitor. Use consistent routes and reward alertness to unusual sounds or movements within the boundary. Teach difference between normal and suspicious activity.",
          duration: "45 min",
          completed: false,
        },
        {
          id: "controlled-aggression",
          title: "Controlled Protection Response",
          content: "Advanced training requiring professional guidance. Teach dog to show controlled protective behavior on command but immediately stop when told. This should only be done with experienced trainers and well-socialized, stable dogs. Focus on deterrent rather than attack.",
          duration: "60 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-senior",
      title: "Senior Dog Care",
      description: "Caring for older dogs with adapted training and exercise",
      petType: "dog",
      progress: 0,
      duration: "4 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "gentle-exercise",
          title: "Adapted Exercise Routines",
          content: "Adjust exercise intensity for aging joints. Focus on shorter, more frequent walks rather than long hikes. Swimming is excellent low-impact exercise. Monitor breathing and energy levels. Provide orthopedic bedding and warm sleeping areas for arthritic joints.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "mental-stimulation",
          title: "Senior Mental Enrichment",
          content: "Keep senior dogs mentally sharp with puzzle toys and gentle training. Use food-dispensing toys to encourage problem-solving. Continue training sessions but keep them shorter. New tricks can be learned at any age and help maintain cognitive function.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "health-monitoring",
          title: "Health Awareness for Seniors",
          content: "Learn to recognize signs of age-related health changes. Monitor eating, drinking, and bathroom habits for changes. Watch for confusion, disorientation, or changes in sleep patterns. Maintain regular vet checkups and discuss pain management options if needed.",
          duration: "30 min",
          completed: false,
        },
      ],
    },

    // Additional Dog Courses
    {
      id: "dog-therapy",
      title: "Therapy Dog Training",
      description: "Train your dog to provide comfort and emotional support",
      petType: "dog",
      progress: 0,
      duration: "10 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "calm-presence",
          title: "Developing Calm Presence",
          content: "Therapy dogs must remain calm in all situations. Practice exposure to wheelchairs, walkers, and medical equipment. Train your dog to be gentle around fragile people. Work on impulse control - no jumping, pulling, or overexcitement. Practice holding still for petting from multiple people.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "public-behavior",
          title: "Public Access Training",
          content: "Master advanced obedience in public settings. Train reliable responses to commands even with distractions. Practice walking through crowds, elevators, and medical facilities. Your dog should ignore food, other animals, and sudden movements while maintaining focus on you.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "interaction-skills",
          title: "Appropriate Interaction Skills",
          content: "Learn to read body language of people who may be nervous around dogs. Train your dog to approach slowly and gently. Practice 'visit' positions where your dog can be easily petted while lying down or sitting calmly. Work on accepting handling from strangers.",
          duration: "30 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-sports",
      title: "Dog Sports Preparation",
      description: "Conditioning and skills for competitive dog sports",
      petType: "dog",
      progress: 0,
      duration: "12 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "fitness-conditioning",
          title: "Athletic Conditioning",
          content: "Build your dog's strength, endurance, and flexibility for sports competition. Start with basic exercises like sit-to-stands, balance work on wobble boards, and core strengthening. Gradually increase duration and intensity. Include warm-up and cool-down routines to prevent injury.",
          duration: "45 min",
          completed: false,
        },
        {
          id: "focus-training",
          title: "Competition Focus",
          content: "Train intense focus despite distractions. Practice in increasingly challenging environments with other dogs, crowds, and loud noises. Use high-value rewards and build drive for the sport. Work on maintaining attention even when excited or aroused.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "sport-specific",
          title: "Sport-Specific Skills",
          content: "Whether training for agility, flyball, dock diving, or disc sports, master the fundamental skills. Practice precision, speed, and teamwork. Video your training sessions to analyze technique. Work with sport-specific equipment and environments.",
          duration: "50 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-tracking",
      title: "Scent Work & Tracking",
      description: "Develop your dog's natural scenting abilities",
      petType: "dog",
      progress: 0,
      duration: "8 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "basic-scenting",
          title: "Introduction to Scent Work",
          content: "Start with simple scent games using treats hidden in boxes. Let your dog use their nose to find rewards. Progress to essential oil scents on cotton swabs. Build positive associations with target scents through food rewards and play.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "tracking-basics",
          title: "Ground Tracking Fundamentals",
          content: "Begin with short, straight tracks in calm weather. Start by walking with your dog and dropping treats along the way. Gradually transition to tracks made by others. Use a harness and long line for tracking work. Teach your dog to follow human scent trails methodically.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "advanced-tracking",
          title: "Complex Tracking Scenarios",
          content: "Progress to aged tracks, turns, and cross-tracks. Work in different weather conditions and terrain types. Practice tracking in areas with distractions. Train indication behaviors when your dog finds the target person or object at the end of the track.",
          duration: "45 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-service-prep",
      title: "Service Dog Foundation",
      description: "Basic training for future service dog candidates",
      petType: "dog",
      progress: 0,
      duration: "16 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "public-access",
          title: "Public Access Skills",
          content: "Master reliable obedience in all public settings. Train your dog to ignore distractions, remain calm in crowds, and respond immediately to commands. Practice in stores, restaurants, and transportation. Focus on invisible presence - your dog should not draw attention.",
          duration: "60 min",
          completed: false,
        },
        {
          id: "task-training",
          title: "Basic Task Training",
          content: "Learn foundation skills for specific service tasks like retrieving items, opening doors, providing balance support, or alerting behaviors. Tasks must be directly related to the handler's disability. Practice consistency and reliability in task performance.",
          duration: "50 min",
          completed: false,
        },
        {
          id: "handler-bonding",
          title: "Handler Partnership",
          content: "Develop deep bond and communication with handler. Train attentiveness to handler's needs and emotional state. Practice working in close partnership, reading subtle cues, and providing appropriate responses. Build trust and reliability in the working relationship.",
          duration: "45 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-behavior-problems",
      title: "Behavior Problem Solutions",
      description: "Address common behavioral issues with positive methods",
      petType: "dog",
      progress: 0,
      duration: "6 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "excessive-barking",
          title: "Barking Management",
          content: "Identify triggers for excessive barking and address root causes. Train 'quiet' command using positive reinforcement. Provide alternative behaviors like 'place' or 'watch me'. Use environmental management to reduce barking triggers. Never use shock collars or punishment methods.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "destructive-behavior",
          title: "Preventing Destructive Behavior",
          content: "Address causes of destructive behavior like boredom, anxiety, or excess energy. Provide appropriate outlets through exercise, mental stimulation, and chew toys. Use management techniques like crating or exercise pens when unsupervised. Redirect destructive behavior to appropriate activities.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "resource-guarding",
          title: "Resource Guarding Solutions",
          content: "Safely address food, toy, or space guarding using positive methods. Never punish or forcibly take items - this increases guarding. Teach 'drop it' and 'leave it' commands using high-value trade rewards. Work on building trust and positive associations with handling.",
          duration: "40 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-swimming",
      title: "Water Safety & Swimming",
      description: "Teaching your dog to swim safely and enjoy water activities",
      petType: "dog",
      progress: 0,
      duration: "5 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "water-introduction",
          title: "Introducing Your Dog to Water",
          content: "Start with shallow water like kiddie pools or calm beaches. Let your dog explore at their own pace. Never force or throw them into water. Use toys and treats to create positive associations. Wear a properly fitted life jacket during early sessions.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "swimming-technique",
          title: "Teaching Swimming Technique",
          content: "Support your dog's hindquarters as they learn to swim - many dogs only paddle with front legs initially. Practice in safe, calm water. Build endurance gradually starting with 5-minute sessions. Always supervise closely and use life jackets for safety.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "water-safety",
          title: "Water Safety Rules",
          content: "Teach pool exit skills - show your dog where steps are located. Rinse coat after swimming in pools or salt water. Watch for signs of fatigue. Never let dogs swim unsupervised. Be aware of water conditions, currents, and temperature.",
          duration: "25 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-urban",
      title: "Urban Dog Training",
      description: "Essential skills for city living with your dog",
      petType: "dog",
      progress: 0,
      duration: "6 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "city-sounds",
          title: "Desensitizing to City Noises",
          content: "Gradually expose your dog to sirens, traffic, construction sounds, and crowds. Use positive reinforcement during exposure. Create positive associations with city sounds through treats and play. Practice in progressively busier environments.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "sidewalk-etiquette",
          title: "Sidewalk Walking Skills",
          content: "Train your dog to walk calmly past people, other dogs, and street distractions. Practice sitting at curbs and waiting for crossing signals. Teach 'side' to have your dog move out of pedestrians' way. Master navigating through crowds.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "elevator-stairs",
          title: "Elevator and Stair Training",
          content: "Desensitize to elevators by starting with doors only, then brief rides. Practice stair climbing with proper leash control. Train calmness when meeting neighbors in hallways. Work on good behavior in apartment common areas.",
          duration: "20 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-off-leash",
      title: "Reliable Off-Leash Training",
      description: "Building rock-solid recall and off-leash control",
      petType: "dog",
      progress: 0,
      duration: "10 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "recall-mastery",
          title: "Bulletproof Recall",
          content: "Build an emergency recall using unique word and extra high-value rewards. Practice with long lines before going off-leash. Train in increasingly distracting environments. Never call your dog to come for something negative. Make coming to you the best thing ever.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "distance-control",
          title: "Distance Control Commands",
          content: "Train sit, down, and stay at increasing distances. Use hand signals for visual commands at distance. Practice directional controls - left, right, away, come in. Build reliability before removing leash completely.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "distraction-proofing",
          title: "Proofing Around Distractions",
          content: "Practice off-leash control near squirrels, other dogs, people, and food. Start at safe distances and gradually decrease. Use long lines for safety during training. Build impulse control through 'wait' and 'leave it' commands.",
          duration: "45 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-hiking",
      title: "Trail & Hiking Training",
      description: "Prepare your dog for safe outdoor adventures",
      petType: "dog",
      progress: 0,
      duration: "7 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "trail-readiness",
          title: "Building Hiking Endurance",
          content: "Gradually condition your dog for longer hikes. Start with short trails and build distance over weeks. Pay attention to paw pad condition. Bring plenty of water and take frequent breaks. Learn to recognize signs of overexertion or heat stress.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "wildlife-encounters",
          title: "Wildlife Safety & Awareness",
          content: "Train your dog to ignore wildlife sightings. Practice strong 'leave it' command for animal scat and food. Keep dogs leashed in wildlife areas. Learn local wildlife risks and appropriate responses. Carry bear bells or make noise in bear country.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "trail-etiquette",
          title: "Trail Etiquette & Rules",
          content: "Teach your dog to yield trail to others, especially horses. Practice stepping off trail calmly when meeting others. Pack out all waste. Keep dog on leash unless in designated off-leash areas. Respect wildlife and other trail users.",
          duration: "25 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-car-training",
      title: "Car Travel & Road Trips",
      description: "Making car rides safe and enjoyable for your dog",
      petType: "dog",
      progress: 0,
      duration: "4 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "car-introduction",
          title: "Introducing Your Dog to the Car",
          content: "Start with car turned off - let dog explore and receive treats. Progress to engine on, then short trips around block. Use secure restraints like harnesses or crates. Never allow dogs to ride with head out window (eye injuries). Build positive associations gradually.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "motion-sickness",
          title: "Preventing Car Sickness",
          content: "Face dog forward to reduce motion sickness. Keep car cool and well-ventilated. Avoid feeding right before travel. Take frequent breaks on long trips. Consider anti-nausea medication for severe cases after consulting vet.",
          duration: "18 min",
          completed: false,
        },
        {
          id: "long-distance-travel",
          title: "Road Trip Preparation",
          content: "Plan rest stops every 2-3 hours for exercise and bathroom breaks. Pack water, food, bowls, leash, first aid kit. Keep ID tags and documents handy. Research pet-friendly hotels. Never leave dog alone in parked car.",
          duration: "25 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-kids",
      title: "Dogs & Children Safety",
      description: "Building safe, positive relationships between dogs and kids",
      petType: "dog",
      progress: 0,
      duration: "6 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "gentle-interaction",
          title: "Teaching Gentle Interaction",
          content: "Train your dog to be calm around children's unpredictable movements. Practice tolerance for gentle pulling, poking, and loud noises. Supervise all interactions. Teach children proper dog handling - gentle petting, no tail or ear pulling, respect dog's space.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "child-safety-rules",
          title: "Safety Rules for Kids & Dogs",
          content: "Teach children never to disturb sleeping or eating dogs. No hugging or kissing dog's face. Recognize warning signs - stiff body, whale eye, lip licking. Always ask permission before petting strange dogs. Supervise young children with dogs at all times.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "preparing-baby",
          title: "Preparing Dog for New Baby",
          content: "Before baby arrives, practice with baby sounds recordings and doll. Establish new routines early. Create positive associations with baby items. Never exclude dog completely - include them in family activities. Reward calm behavior around baby. Monitor interactions closely.",
          duration: "35 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-grooming-training",
      title: "Cooperative Grooming Training",
      description: "Teaching your dog to accept and enjoy grooming",
      petType: "dog",
      progress: 0,
      duration: "5 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "touch-desensitization",
          title: "Touch Acceptance Training",
          content: "Gradually desensitize your dog to handling all body parts. Touch paws, ears, tail, mouth briefly and reward. Build duration slowly. Practice daily in short sessions. This prepares dog for grooming, vet visits, and nail trims.",
          duration: "15 min",
          completed: false,
        },
        {
          id: "bath-training",
          title: "Positive Bath Time",
          content: "Make bath time positive with treats and calm praise. Use non-slip mats in tub. Start with just getting in tub without water. Gradually add warm water, then gentle washing. Use dog-specific shampoo. Reward throughout process. End with special treat.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "grooming-tools",
          title: "Accepting Grooming Tools",
          content: "Introduce brushes, combs, nail clippers, and dryers gradually. Let dog sniff tools first. Touch dog briefly with tool and reward. Practice in short, positive sessions. For nail trimming, start with just holding paw, then touching clipper to nail before cutting.",
          duration: "20 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-reactivity",
      title: "Leash Reactivity Solutions",
      description: "Managing and reducing leash reactive behaviors",
      petType: "dog",
      progress: 0,
      duration: "8 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "identifying-triggers",
          title: "Understanding Reactivity Triggers",
          content: "Identify what triggers reactive behavior - other dogs, bikes, cars, people. Note threshold distance where dog reacts. Understand reactivity often stems from fear, frustration, or barrier frustration. Never punish reactive behavior - it increases stress.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "counter-conditioning",
          title: "Counter-Conditioning Protocol",
          content: "Keep dog under threshold distance from triggers. When trigger appears, immediately provide high-value treats. Create positive association: trigger predicts good things. Gradually decrease distance to trigger over many sessions. Progress slowly - rushing causes setbacks.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "engagement-training",
          title: "Building Engagement & Focus",
          content: "Train strong attention on you using 'watch me' or 'look at me' cue. Practice engagement in low-distraction environments first. Use extremely high-value rewards. Build duration of eye contact. This gives alternative behavior to reactivity.",
          duration: "35 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-tricks-advanced",
      title: "Advanced Dog Tricks",
      description: "Impressive tricks to wow your friends and family",
      petType: "dog",
      progress: 0,
      duration: "10 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "play-dead",
          title: "Play Dead & Roll Over",
          content: "Start with dog in down position. Lure them onto side with treat, say 'Bang!' or 'Play dead'. Progress to rolling completely over. Add duration - dog stays on side until released. Make it dramatic and fun. Build on 'down' and 'stay' foundation.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "back-up-crawl",
          title: "Backing Up & Army Crawl",
          content: "For backing up, step toward dog while they're standing, reward backward steps. Add verbal cue 'Back'. For army crawl, start in down position, lure forward with treat held low. Dog should crawl on belly. Add distance gradually.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "object-discrimination",
          title: "Toy Name Recognition",
          content: "Teach names of individual toys. Start with one toy, say name repeatedly while playing. Add second toy and ask for specific one. Reward correct choices. Build vocabulary of 5-10 toy names. This impresses everyone and provides mental stimulation.",
          duration: "35 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-nutrition-training",
      title: "Healthy Eating Habits",
      description: "Training proper feeding behaviors and food manners",
      petType: "dog",
      progress: 0,
      duration: "3 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "slow-feeding",
          title: "Preventing Food Gulping",
          content: "Use slow-feeder bowls or scatter food to slow eating pace. This prevents bloat and aids digestion. Feed smaller meals more frequently. Practice 'wait' before meals - dog must sit calmly before bowl is placed down. This builds impulse control around food.",
          duration: "15 min",
          completed: false,
        },
        {
          id: "no-begging",
          title: "Eliminating Begging Behavior",
          content: "Never feed from table or while preparing food. Teach 'place' command - dog goes to bed during meals. Reward staying in place with occasional treats (not human food). Consistency is key - all family members must follow rules. Redirect begging to appropriate location.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "food-manners",
          title: "Polite Food Behavior",
          content: "Train gentle treat-taking from hands. Practice 'leave it' with dropped food. Teach dog to sit and wait before receiving food or treats. Work on impulse control exercises like balancing treat on nose. These skills create polite, controlled behavior around food.",
          duration: "18 min",
          completed: false,
        },
      ],
    },

    // Additional Cat Courses
    {
      id: "cat-agility",
      title: "Cat Agility Training",
      description: "Fun agility exercises and obstacle training for cats",
      petType: "cat",
      progress: 0,
      duration: "6 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "obstacle-intro",
          title: "Introduction to Obstacles",
          content: "Start with simple, low obstacles like a broomstick on the ground or a small cardboard box. Use treats and toys to lure your cat over or through obstacles. Make it fun and rewarding - cats must be motivated to participate. Keep sessions very short (3-5 minutes) to maintain interest.",
          duration: "15 min",
          completed: false,
        },
        {
          id: "jump-training-cat",
          title: "Teaching Cats to Jump",
          content: "Begin with very low jumps that your cat can easily step over. Use a favorite toy or treat to encourage jumping. Gradually raise height as your cat becomes comfortable. Most cats can jump much higher than dogs, but start low to build confidence and understanding.",
          duration: "18 min",
          completed: false,
        },
        {
          id: "tunnel-weave",
          title: "Tunnels and Weaving",
          content: "Introduce tunnels using large cardboard boxes or play tunnels. Encourage exploration with treats placed inside. For weaving, use lightweight poles that won't hurt if knocked over. Guide your cat through the pattern with toys or treats. Celebrate every success enthusiastically.",
          duration: "20 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-therapy",
      title: "Cat Therapy Training",
      description: "Prepare your cat for therapy work in hospitals and facilities",
      petType: "cat",
      progress: 0,
      duration: "12 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "temperament-assessment",
          title: "Therapy Cat Temperament",
          content: "Evaluate your cat's suitability for therapy work. Ideal therapy cats are calm, confident, and enjoy being handled by strangers. They should be comfortable with medical equipment sounds and unexpected movements. Not all cats are suited for this work - temperament is key.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "handling-tolerance",
          title: "Accepting Gentle Handling",
          content: "Train your cat to accept gentle petting from various people, including those with tremors or unsteady movements. Practice being held in different positions. Work on tolerance for medical equipment like wheelchairs, walkers, and oxygen tanks. Use positive associations with new experiences.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "facility-preparation",
          title: "Healthcare Facility Preparation",
          content: "Acclimate your cat to healthcare environments gradually. Practice in carrier training for transport. Expose to hospital sounds, smells, and lighting. Train calm behavior on examination tables and beds. Work with therapy animal organizations for proper certification and placement.",
          duration: "35 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-communication",
      title: "Understanding Cat Communication",
      description: "Learn to interpret your cat's body language and vocalizations",
      petType: "cat",
      progress: 0,
      duration: "3 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "body-language",
          title: "Reading Cat Body Language",
          content: "Learn to interpret tail positions, ear movements, and postures. A high, quivering tail indicates excitement; low or tucked means fear or submission. Flattened ears signal fear or aggression. Slow blinking is a sign of contentment and trust. Watch for subtle stress signals like excessive grooming.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "vocal-communication",
          title: "Understanding Cat Vocalizations",
          content: "Different meows have different meanings. Short meows are greetings, long meows may indicate demands or complaints. Purring usually means contentment but can also indicate pain or stress. Chirping and chattering often occur when watching prey. Hissing and growling are clear warning signals.",
          duration: "18 min",
          completed: false,
        },
        {
          id: "scent-marking",
          title: "Scent Communication",
          content: "Cats communicate through scent marking behaviors. Head bunting and cheek rubbing deposit friendly pheromones. Scratching leaves both visual and scent marks. Urine marking can indicate territory, stress, or medical issues. Understanding scent communication helps interpret your cat's emotional state.",
          duration: "22 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-senior-care",
      title: "Senior Cat Care & Comfort",
      description: "Specialized care for older cats and age-related changes",
      petType: "cat",
      progress: 0,
      duration: "4 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "mobility-assistance",
          title: "Helping with Reduced Mobility",
          content: "Provide ramps or steps to help senior cats reach favorite elevated spots. Use litter boxes with lower sides for easier entry. Place food and water dishes at comfortable heights. Consider heated beds for arthritic joints. Monitor for signs of pain like reluctance to jump or climb.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "health-monitoring-senior",
          title: "Senior Health Monitoring",
          content: "Watch for changes in eating, drinking, and bathroom habits that may indicate health issues. Monitor for confusion or disorientation. Check for weight loss or gain. Senior cats need more frequent veterinary checkups. Be alert to signs of kidney disease, hyperthyroidism, and dental problems.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "comfort-adaptations",
          title: "Comfort and Environmental Adaptations",
          content: "Adapt your home for senior cat comfort. Provide easily accessible sleeping areas with soft bedding. Ensure litter boxes are on each floor of multi-story homes. Maintain consistent routines as senior cats find comfort in predictability. Consider night lights for cats with vision changes.",
          duration: "20 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-problem-solving",
      title: "Cat Behavior Problem Solving",
      description: "Address common cat behavioral issues with positive solutions",
      petType: "cat",
      progress: 0,
      duration: "5 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "litter-box-issues",
          title: "Solving Litter Box Problems",
          content: "Address inappropriate elimination by first ruling out medical causes. Ensure adequate number of clean litter boxes (n+1 rule). Experiment with different litter types and box locations. Clean accidents thoroughly with enzyme cleaners. Never punish - instead identify and remove stressors.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "aggressive-behavior",
          title: "Managing Cat Aggression",
          content: "Identify triggers for aggressive behavior such as overstimulation, fear, or redirected aggression. Learn to recognize warning signs before escalation. Provide environmental enrichment to reduce stress. Use positive training methods to redirect aggressive behaviors into appropriate outlets.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "excessive-vocalization",
          title: "Addressing Excessive Meowing",
          content: "Determine causes of excessive vocalization - medical issues, attention-seeking, or stress. Provide adequate mental and physical stimulation. Ignore attention-seeking meowing while rewarding quiet behavior. For senior cats, rule out cognitive dysfunction. Maintain consistent daily routines.",
          duration: "25 min",
          completed: false,
        },
      ],
    },

    // Additional Cat Courses
    {
      id: "cat-kitten",
      title: "Kitten Care Basics",
      description: "Essential care and training for kittens 8-16 weeks old",
      petType: "cat",
      progress: 0,
      duration: "8 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "kitten-feeding",
          title: "Proper Kitten Nutrition",
          content: "Feed high-quality kitten food with higher protein and calorie content than adult cat food. Feed small, frequent meals (3-4 times daily). Always provide fresh water. Transition from mother's milk or formula gradually. Monitor weight gain weekly during first few months.",
          duration: "15 min",
          completed: false,
        },
        {
          id: "kitten-socialization",
          title: "Early Socialization Window",
          content: "The critical socialization period is 2-7 weeks. Expose kittens to gentle handling, various sounds, textures, and experiences. Handle paws, ears, and mouth daily to prepare for future grooming and vet visits. Introduce to friendly people and well-behaved animals.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "kitten-play",
          title: "Appropriate Kitten Play",
          content: "Redirect rough play from hands to appropriate toys. Use wand toys and small balls for interactive play. Avoid using hands as toys to prevent biting habits. Provide solo play options like balls and mice toys. Play helps develop coordination and hunting skills.",
          duration: "18 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-communication",
      title: "Cat Communication & Body Language",
      description: "Understanding what your cat is trying to tell you",
      petType: "cat",
      progress: 0,
      duration: "3 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "tail-signals",
          title: "Reading Tail Language",
          content: "Learn tail positions and their meanings: upright tail shows confidence and friendliness, puffed tail indicates fear or aggression, tucked tail shows submission or fear, twitching tip shows excitement or irritation. Observe entire body context, not just tail alone.",
          duration: "12 min",
          completed: false,
        },
        {
          id: "vocal-communication",
          title: "Understanding Cat Vocalizations",
          content: "Different meows have different meanings: short meow is greeting, long meow often means demanding attention, purring usually shows contentment but can indicate pain, chirping/chattering at birds shows hunting excitement, yowling may indicate distress or mating calls.",
          duration: "15 min",
          completed: false,
        },
        {
          id: "scent-marking",
          title: "Scent Communication",
          content: "Cats communicate through scent marking: head bunting deposits friendly pheromones, scratching marks territory visually and with scent, urine marking shows stress or territorial claims, cheek rubbing on objects claims territory. Provide appropriate marking opportunities.",
          duration: "18 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-outdoor",
      title: "Outdoor Cat Safety",
      description: "Keeping outdoor cats safe while allowing natural behaviors",
      petType: "cat",
      progress: 0,
      duration: "4 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "harness-training",
          title: "Harness and Leash Training",
          content: "Start by letting cat wear harness indoors for short periods with treats and praise. Gradually increase wearing time before adding leash. Practice indoors first, then move to secure outdoor areas. Never force - let cat set the pace. Use escape-proof harnesses designed for cats.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "catio-design",
          title: "Creating Safe Outdoor Spaces",
          content: "Design enclosed outdoor spaces (catios) with secure screening, multiple levels, hiding spots, and weather protection. Include scratching surfaces, perches for bird watching, and safe plants. Ensure escape-proof construction and protection from predators.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "outdoor-dangers",
          title: "Identifying Outdoor Hazards",
          content: "Learn about common outdoor dangers: toxic plants, antifreeze, rat poison, other animals, traffic, and getting lost. Ensure cats are microchipped and wear breakaway collars with ID. Consider GPS trackers for outdoor cats. Know signs of poisoning and emergency procedures.",
          duration: "35 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-aggression",
      title: "Cat Aggression Management",
      description: "Understanding and managing different types of cat aggression",
      petType: "cat",
      progress: 0,
      duration: "6 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "aggression-types",
          title: "Types of Feline Aggression",
          content: "Identify different aggression types: play aggression (overstimulation during petting), territorial aggression (defending resources), redirected aggression (can't reach target, attacks nearest object), fear aggression (defensive response), predatory aggression (hunting behavior). Each requires different management approaches.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "trigger-identification",
          title: "Identifying Aggression Triggers",
          content: "Keep a diary of aggressive incidents noting time, location, circumstances, and targets. Common triggers include: sudden movements, certain sounds, specific locations, handling sensitive areas, or presence of other animals. Understanding triggers helps prevent incidents.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "behavior-modification",
          title: "Behavior Modification Techniques",
          content: "Use counter-conditioning to change emotional response to triggers. Gradually expose cat to triggers at low intensity while providing positive experiences. Never punish aggression as this can escalate problems. Provide environmental enrichment to reduce stress and redirect energy.",
          duration: "40 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-senior",
      title: "Senior Cat Care",
      description: "Caring for cats 7+ years with age-appropriate modifications",
      petType: "cat",
      progress: 0,
      duration: "5 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "senior-health",
          title: "Senior Health Monitoring",
          content: "Watch for signs of arthritis: difficulty jumping, reluctance to climb stairs, changes in litter box habits. Monitor for kidney disease signs: increased drinking/urination, weight loss, poor appetite. Schedule bi-annual vet checkups and discuss senior wellness plans.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "environmental-modifications",
          title: "Age-Friendly Environment",
          content: "Provide lower litter boxes with easier access. Add ramps or steps to favorite high spots. Offer orthopedic bedding for arthritic joints. Ensure food and water are easily accessible. Consider heated beds for comfort. Maintain consistent routines to reduce stress.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "cognitive-health",
          title: "Maintaining Cognitive Function",
          content: "Keep senior cats mentally active with puzzle feeders and gentle play. Maintain social interaction and environmental enrichment. Watch for signs of cognitive decline: disorientation, changes in sleep patterns, increased vocalization, inappropriate elimination. Provide consistent, calm environment.",
          duration: "30 min",
          completed: false,
        },
      ],
    },

    // NEW DOG COURSES
    {
      id: "dog-therapy",
      title: "Therapy Dog Training",
      description: "Training dogs for therapy and emotional support work",
      petType: "dog",
      progress: 0,
      duration: "12 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "therapy-temperament",
          title: "Temperament Assessment",
          content: "Evaluate your dog's natural temperament for therapy work. Dogs need to be calm, friendly, and comfortable with strangers. Test reactions to sudden noises, wheelchair users, and medical equipment. Practice calm greetings with people of all ages. Only dogs with stable, gentle temperaments should pursue therapy certification.",
          duration: "45 min",
          completed: false,
        },
        {
          id: "therapy-commands",
          title: "Specialized Therapy Commands",
          content: "Teach 'gentle' for soft interactions, 'visit' for approaching patients, and 'enough' for ending interactions. Practice 'settle' for lying calmly beside someone for extended periods. Train impulse control around food, medications, and medical equipment. Master walking on various surfaces like hospital floors.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "therapy-certification",
          title: "Certification Preparation",
          content: "Practice in hospital-like environments with medical equipment sounds. Train around wheelchairs, walkers, and crutches. Work on maintaining calm behavior during emotional situations. Practice with children, elderly, and people with disabilities. Prepare for formal therapy dog evaluations and certification tests.",
          duration: "50 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-hunting",
      title: "Hunting & Sporting Dog Training", 
      description: "Training for hunting, retrieving, and sporting activities",
      petType: "dog",
      progress: 0,
      duration: "10 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "hunt-pointing",
          title: "Pointing and Steady Training",
          content: "Start with frozen birds or bird wings to introduce scent. Encourage natural pointing instincts, rewarding when dog freezes upon finding scent. Use 'whoa' command to enforce steadiness. Practice with increasingly distracting scenarios. Never rush - pointing dogs need time to develop their natural instincts properly.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "hunt-retrieve",
          title: "Water Retrieval Training",
          content: "Start with short retrieves on land, then progress to water's edge. Use floating bumpers and start in shallow, calm water. Build confidence gradually - never force a dog into water. Practice 'mark' training where dog watches object fall and retrieves on command. Train steady delivery to hand without dropping.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "hunt-field-work",
          title: "Field Work and Quartering",
          content: "Teach systematic field coverage using whistle commands and hand signals. Practice quartering patterns to efficiently cover hunting areas. Train response to directional commands at distance. Work on honoring other dogs' points and maintaining discipline around game. Build stamina for long hunting days.",
          duration: "45 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-service",
      title: "Service Dog Foundation Training",
      description: "Basic foundation skills for potential service dog training",
      petType: "dog", 
      progress: 0,
      duration: "16 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "service-public-access",
          title: "Public Access Skills",
          content: "Train impeccable behavior in public spaces. Practice walking calmly through crowds, ignoring food on floor, and maintaining focus despite distractions. Work on proper elevator behavior, restaurant etiquette, and airplane travel skills. Dogs must be completely reliable before advancing to task-specific training.",
          duration: "60 min",
          completed: false,
        },
        {
          id: "service-task-intro",
          title: "Basic Task Training Introduction",
          content: "Start with simple tasks like retrieving dropped items, opening/closing doors, and light switch operation. Teach 'get help' for alerting others in emergencies. Practice pressure therapy and deep pressure stimulation. Focus on reliability and consistency - service dogs must perform tasks on command every time.",
          duration: "55 min", 
          completed: false,
        },
        {
          id: "service-handler-focus",
          title: "Handler Focus and Bonding",
          content: "Develop unwavering focus on handler despite environmental distractions. Practice working under stress and in emergency situations. Train to recognize handler's emotional and physical states. Build trust and communication that allows dog to anticipate needs. This deep bond is essential for effective service work.",
          duration: "50 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-canine-sports",
      title: "Canine Sports Preparation",
      description: "Training for competitive dog sports and activities",
      petType: "dog",
      progress: 0,
      duration: "8 weeks", 
      difficulty: "Intermediate",
      lessons: [
        {
          id: "sports-conditioning",
          title: "Athletic Conditioning",
          content: "Build stamina with progressive exercise routines. Practice balance exercises using wobble boards and balance discs. Develop core strength with cavaletti work and hill training. Stretch and warm up before intense activity. Monitor for signs of fatigue or injury. Proper conditioning prevents sports injuries.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "sports-focus-drive",
          title: "Focus and Drive Development",
          content: "Build intense focus and motivation through play and reward systems. Practice maintaining attention despite distractions from other dogs and spectators. Develop 'start line stays' for reliable competition starts. Train explosive acceleration and precise stops. Balance excitement with control for optimal performance.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "sports-competition-prep",
          title: "Competition Preparation",
          content: "Practice in mock competition environments with noise and distractions. Train ring entrances and exits professionally. Work on handler communication and teamwork under pressure. Prepare for different judging styles and ring layouts. Build confidence through positive training experiences and gradual exposure to competition stress.",
          duration: "40 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-behavioral-modification",
      title: "Behavioral Modification Techniques",
      description: "Advanced techniques for modifying problem behaviors",
      petType: "dog",
      progress: 0,
      duration: "6 weeks",
      difficulty: "Advanced", 
      lessons: [
        {
          id: "behavior-counter-conditioning",
          title: "Counter-Conditioning Methods",
          content: "Change emotional responses to triggers through positive associations. Start with triggers at low intensity and pair with high-value rewards. Gradually increase trigger intensity while maintaining positive emotional state. Never force confrontations with feared objects. Success requires patience and consistency over weeks or months.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "behavior-desensitization",
          title: "Systematic Desensitization",
          content: "Create hierarchy of fear triggers from least to most intense. Start with very mild versions of triggers that don't cause anxiety. Slowly progress up hierarchy only when dog is completely comfortable at current level. Combine with relaxation techniques and positive reinforcement. Never skip steps or rush the process.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "behavior-management",
          title: "Environmental Management",
          content: "Modify environment to prevent rehearsal of problem behaviors. Use management tools like baby gates, crates, and leashes strategically. Create success by controlling access to triggers during training phases. Combine management with active training for fastest results. Management alone won't cure problems but prevents worsening.",
          duration: "30 min",
          completed: false,
        },
      ],
    },

    // NEW CAT COURSES
    {
      id: "cat-training-advanced",
      title: "Advanced Cat Training",
      description: "Complex tricks and behaviors for experienced cat trainers",
      petType: "cat",
      progress: 0,
      duration: "8 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "target-training",
          title: "Target Training Foundation",
          content: "Teach your cat to touch a target stick or your hand with their nose or paw. Start by presenting the target close to their face, click and reward when they investigate it. Gradually add the verbal cue 'touch.' This forms the foundation for many complex behaviors and tricks.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "agility-basics",
          title: "Cat Agility Training",
          content: "Set up simple obstacles like low jumps, tunnels, and weave poles. Use treats and target training to guide cats through obstacles. Start with very low, easy obstacles and gradually increase difficulty. Make it fun and always end on a positive note. Not all cats enjoy agility, respect individual preferences.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "complex-tricks",
          title: "Complex Trick Training",
          content: "Build on basic commands to teach complex behaviors like 'play dead,' 'spin,' and 'fetch.' Break each trick into small steps and reward progress. Use shaping techniques to gradually build the complete behavior. Be patient - cats learn at their own pace and some tricks may take weeks to master.",
          duration: "35 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-behavior-problems",
      title: "Cat Behavior Problem Solving",
      description: "Addressing common behavioral issues in cats",
      petType: "cat",
      progress: 0,
      duration: "6 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "inappropriate-elimination",
          title: "Litter Box Problems",
          content: "Identify causes of inappropriate elimination: medical issues, litter box cleanliness, location problems, or stress. Rule out medical causes first with vet visit. Provide multiple clean boxes in quiet locations. Try different litter types and box styles. Address underlying stress with environmental enrichment.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "destructive-scratching",
          title: "Destructive Scratching Solutions",
          content: "Provide appropriate scratching surfaces and make inappropriate ones less appealing. Use double-sided tape, aluminum foil, or scratching deterrent sprays on furniture. Reward use of appropriate scratching posts with treats and catnip. Trim nails regularly to reduce damage potential.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "excessive-vocalization",
          title: "Managing Excessive Meowing",
          content: "Identify triggers for excessive vocalization: attention-seeking, medical issues, stress, or cognitive decline in seniors. Don't reward demanding behavior with attention. Provide scheduled interaction and play times. Ensure all physical needs are met. Consult vet if sudden changes in vocal behavior occur.",
          duration: "28 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-indoor-outdoor",
      title: "Indoor-Outdoor Transition",
      description: "Safely transitioning cats between indoor and outdoor life",
      petType: "cat",
      progress: 0,
      duration: "10 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "indoor-to-outdoor",
          title: "Transitioning Indoor Cats Outside",
          content: "Start with supervised outdoor time in secure areas. Use harness and leash initially for control. Build confidence gradually with short sessions in safe, enclosed spaces like patios or gardens. Ensure all vaccinations are current and cat is spayed/neutered before outdoor access.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "outdoor-to-indoor",
          title: "Bringing Outdoor Cats Inside",
          content: "Provide plenty of environmental enrichment to replace outdoor stimulation. Install window perches for bird watching. Use puzzle feeders and interactive toys. Create vertical spaces with cat trees. Be patient during adjustment period - some cats need weeks to adapt to indoor life.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "supervised-outdoor-time",
          title: "Supervised Outdoor Activities",
          content: "Create safe outdoor experiences through screened porches, cat enclosures, or harness walks. Teach cats to respond to their name and come when called for safety. Monitor for signs of stress or overstimulation during outdoor time. Always supervise interactions with wildlife and other animals.",
          duration: "30 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-multi-species",
      title: "Multi-Species Households",
      description: "Managing cats with dogs, birds, and other pets",
      petType: "cat",
      progress: 0,
      duration: "8 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "cat-dog-introduction",
          title: "Introducing Cats and Dogs",
          content: "Keep pets separated initially, exchanging scents through bedding or toys. Allow visual contact through baby gates before direct meetings. Supervise all interactions and provide escape routes for cats. Feed pets on opposite sides of barriers to create positive associations. Some cats and dogs may never be friends but can coexist peacefully.",
          duration: "45 min",
          completed: false,
        },
        {
          id: "predator-prey-management",
          title: "Managing Predator-Prey Relationships",
          content: "Understand that cats have natural hunting instincts toward birds, small mammals, and fish. Never leave cats unsupervised with prey animals. Provide physical barriers and separate living spaces. Redirect hunting behavior toward appropriate toys. Some combinations (cats and birds) require permanent separation for safety.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "resource-competition",
          title: "Preventing Resource Competition",
          content: "Provide separate food, water, and resting areas for each species. Ensure cats have high perches where other pets can't reach. Use puzzle feeders to slow eating and prevent food guarding. Monitor interactions during feeding times. Each animal should have their own safe space to retreat when stressed.",
          duration: "35 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-wellness-nutrition",
      title: "Cat Wellness & Nutrition",
      description: "Comprehensive health and nutrition management for cats",
      petType: "cat",
      progress: 0,
      duration: "6 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "optimal-nutrition",
          title: "Understanding Cat Nutrition Needs",
          content: "Cats are obligate carnivores requiring high protein diets with specific nutrients like taurine and arachidonic acid. Choose high-quality commercial foods or work with veterinary nutritionists for homemade diets. Avoid foods toxic to cats: onions, garlic, chocolate, grapes, and lilies. Monitor body condition and adjust feeding amounts accordingly.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "weight-management",
          title: "Healthy Weight Maintenance",
          content: "Learn to assess body condition through visual and hands-on evaluation. Ribs should be easily felt but not visible. Use measuring cups for consistent portions. Implement puzzle feeders and food-dispensing toys to slow eating and increase activity. Schedule regular weigh-ins to track progress.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "preventive-care",
          title: "Preventive Health Care",
          content: "Establish regular veterinary checkup schedules: annually for adult cats, bi-annually for seniors. Keep up with core vaccinations and parasite prevention. Monitor for changes in eating, drinking, elimination, and behavior patterns. Learn basic first aid and recognize emergency situations requiring immediate veterinary care.",
          duration: "30 min",
          completed: false,
        },
      ],
    },
    
    // ADDITIONAL DOG COURSES
    {
      id: "dog-tracking",
      title: "Tracking & Scent Work",
      description: "Advanced scent discrimination and tracking techniques",
      petType: "dog",
      progress: 0,
      duration: "10 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "scent-foundation",
          title: "Scent Work Foundation",
          content: "Start with basic scent discrimination using cotton swabs with essential oils. Teach your dog to identify and alert to specific scents. Use consistent reward markers and build scent vocabulary gradually. Practice in controlled environments before moving to outdoor tracking.",
          duration: "30 min",
          completed: false,
        },
        {
          id: "track-laying",
          title: "Track Laying Basics",
          content: "Learn proper technique for laying tracks with appropriate aging, surface conditions, and complexity. Start with straight tracks on grass, gradually adding turns and different terrain. Understand how weather affects scent trails and adjust training accordingly.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "advanced-tracking",
          title: "Advanced Tracking Skills",
          content: "Progress to aged tracks, cross-tracks, and urban tracking scenarios. Train for different weather conditions and various surfaces. Develop silent communication with your dog during tracking work. Practice article indication and evidence recovery techniques.",
          duration: "45 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-water-rescue",
      title: "Water Rescue Training",
      description: "Training dogs for water rescue and lifeguard assistance",
      petType: "dog",
      progress: 0,
      duration: "12 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "water-confidence",
          title: "Building Water Confidence",
          content: "Start with shallow, calm water and gradually build to deeper areas. Use positive reinforcement to create positive associations with water. Practice entry and exit techniques safely. Never force a dog into water - build confidence naturally through play and positive experiences.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "swimming-techniques",
          title: "Advanced Swimming Skills",
          content: "Develop strong, efficient swimming techniques for long-distance work. Practice towing techniques using proper equipment. Train for rough water conditions gradually. Build stamina through progressive swimming exercises and endurance training.",
          duration: "45 min",
          completed: false,
        },
        {
          id: "rescue-scenarios",
          title: "Rescue Scenario Training",
          content: "Practice approaching distressed swimmers safely. Train to deliver flotation devices and tow lines. Work with human volunteers to simulate realistic rescue scenarios. Develop teamwork skills with human lifeguards and rescue personnel.",
          duration: "50 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-detection",
      title: "Detection & Security Work",
      description: "Training for detection work in security and law enforcement",
      petType: "dog",
      progress: 0,
      duration: "14 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "odor-imprinting",
          title: "Target Odor Imprinting",
          content: "Systematically introduce target odors using proper protocols. Build strong positive associations with target scents through food and play rewards. Practice clean scent presentation and contamination avoidance. Develop reliable alert behaviors for target detection.",
          duration: "40 min",
          completed: false,
        },
        {
          id: "search-patterns",
          title: "Systematic Search Patterns",
          content: "Train efficient search patterns for vehicles, buildings, and open areas. Practice methodical coverage techniques and handler direction. Develop off-leash reliability in complex environments. Work on focus and drive maintenance during extended searches.",
          duration: "45 min",
          completed: false,
        },
        {
          id: "operational-deployment",
          title: "Operational Deployment Skills",
          content: "Practice real-world scenarios with distractions and pressure. Train for courtroom testimony and evidence handling procedures. Develop professional deportment in public settings. Work with law enforcement protocols and chain of custody requirements.",
          duration: "55 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-avalanche",
      title: "Avalanche Rescue Training",
      description: "Specialized training for avalanche search and rescue work",
      petType: "dog",
      progress: 0,
      duration: "16 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "snow-adaptation",
          title: "Snow Environment Adaptation",
          content: "Gradually acclimate dogs to snow conditions and cold weather gear. Practice walking and working in deep snow, on skis, and around snow equipment. Build paw protection habits and recognize hypothermia signs. Train for helicopter and snowmobile transportation.",
          duration: "35 min",
          completed: false,
        },
        {
          id: "avalanche-search",
          title: "Avalanche Search Techniques",
          content: "Learn specialized search patterns for avalanche debris fields. Practice rapid deployment and quick area assessment. Train for working in unstable snow conditions safely. Develop skills for pinpointing buried victims through snow layers.",
          duration: "50 min",
          completed: false,
        },
        {
          id: "rescue-coordination",
          title: "Rescue Team Coordination",
          content: "Practice working with ski patrol and rescue teams. Train for probe line coordination and strategic searching. Develop communication skills with rescue personnel. Practice victim recovery techniques and medical team coordination.",
          duration: "45 min",
          completed: false,
        },
      ],
    },
    {
      id: "dog-disability-assist",
      title: "Disability Assistance Training",
      description: "Specialized assistance training for various disabilities",
      petType: "dog",
      progress: 0,
      duration: "18 weeks",
      difficulty: "Advanced",
      lessons: [
        {
          id: "mobility-assistance",
          title: "Mobility Assistance Skills",
          content: "Train for balance support, stability assistance, and mobility aid retrieval. Practice proper body positioning for weight support. Develop skills for wheelchair assistance and transfer support. Learn counter-balance techniques for stability.",
          duration: "50 min",
          completed: false,
        },
        {
          id: "medical-alert",
          title: "Medical Alert Training",
          content: "Train recognition of specific medical conditions like seizures, diabetic episodes, or cardiac events. Develop appropriate alert behaviors and help-seeking responses. Practice medication retrieval and emergency response protocols.",
          duration: "55 min",
          completed: false,
        },
        {
          id: "daily-living-tasks",
          title: "Daily Living Assistance",
          content: "Master complex household tasks like laundry assistance, grocery shopping help, and appliance operation. Train for personal care assistance including dressing aid and hygiene support. Develop problem-solving skills for novel situations.",
          duration: "60 min",
          completed: false,
        },
      ],
    },

    // ADDITIONAL CAT COURSES
    {
      id: "cat-harness-training",
      title: "Harness & Leash Training",
      description: "Teaching cats to walk on harness and leash safely",
      petType: "cat",
      progress: 0,
      duration: "6 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "harness-introduction",
          title: "Harness Introduction",
          content: "Start by letting your cat investigate the harness and associate it with treats. Practice putting it on for very short periods indoors. Gradually increase wearing time while providing positive distractions. Never leave cat unsupervised in harness initially.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "indoor-leash-work",
          title: "Indoor Leash Training",
          content: "Attach leash to harness indoors and let cat drag it under supervision. Practice gentle guidance without pulling. Reward forward movement and following. Build confidence before attempting outdoor adventures. Some cats may never enjoy leash walking.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "outdoor-adventures",
          title: "Safe Outdoor Exploration",
          content: "Start in quiet, enclosed outdoor spaces like fenced yards. Let cat set the pace and direction initially. Gradually introduce new environments and mild distractions. Always prioritize cat's comfort and safety over destination goals.",
          duration: "30 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-clicker-training",
      title: "Clicker Training for Cats",
      description: "Precision training using clicker methods",
      petType: "cat",
      progress: 0,
      duration: "5 weeks",
      difficulty: "Intermediate",
      lessons: [
        {
          id: "clicker-charging",
          title: "Charging the Clicker",
          content: "Pair the click sound with immediate treats until cat perks up at the sound expecting a reward. Keep initial sessions very short (2-3 minutes) to match cats' attention spans. Use high-value treats that your cat finds irresistible.",
          duration: "15 min",
          completed: false,
        },
        {
          id: "targeting-behaviors",
          title: "Targeting and Shaping",
          content: "Start with simple target touching using your hand or a target stick. Click for any movement toward the target, gradually requiring actual contact. Use shaping to build complex behaviors in small steps, rewarding incremental progress.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "advanced-clicker-tricks",
          title: "Advanced Clicker Tricks",
          content: "Build complex behaviors like 'wave,' 'shake hands,' or 'roll over' using clicker precision. Break each trick into manageable steps. Be patient - cats learn at their own pace and some may not enjoy performing tricks.",
          duration: "25 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-travel-training",
      title: "Travel & Carrier Training",
      description: "Preparing cats for stress-free travel and vet visits",
      petType: "cat",
      progress: 0,
      duration: "4 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "carrier-desensitization",
          title: "Carrier Acceptance Training",
          content: "Leave carrier open in living space with comfortable bedding and treats inside. Feed meals near or inside carrier to create positive associations. Gradually practice closing door for short periods. Make carrier a positive resting spot, not just for vet trips.",
          duration: "18 min",
          completed: false,
        },
        {
          id: "car-travel-prep",
          title: "Car Travel Preparation",
          content: "Start with car engine off, then progress to engine running, and finally short drives. Use calming pheromones in carrier and car. Secure carrier safely and provide familiar blankets. Practice timing so cat isn't fed right before travel.",
          duration: "22 min",
          completed: false,
        },
        {
          id: "destination-management",
          title: "Managing New Environments",
          content: "Prepare for vet offices, hotels, and other destinations by bringing familiar items. Practice calm behavior in carrier during handling. Use treats and positive reinforcement in new locations. Plan for litter box access during extended travel.",
          duration: "25 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-kitten-socialization",
      title: "Kitten Socialization Program",
      description: "Critical early socialization for kittens 3-14 weeks old",
      petType: "cat",
      progress: 0,
      duration: "8 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "critical-period",
          title: "Understanding Critical Periods",
          content: "Learn about the crucial 3-14 week socialization window when kittens are most receptive to new experiences. Expose kittens safely to various sights, sounds, textures, and gentle handling. Balance stimulation with adequate rest periods.",
          duration: "20 min",
          completed: false,
        },
        {
          id: "human-socialization",
          title: "Human Interaction Skills",
          content: "Introduce kittens to people of different ages, sizes, and appearances. Practice gentle handling of paws, ears, and mouth for future grooming and vet care. Teach appropriate play behavior and bite inhibition through positive methods.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "environmental-exposure",
          title: "Environmental Enrichment",
          content: "Safely expose kittens to household sounds, different surfaces, and various objects. Create positive associations with carrier, grooming tools, and handling. Introduce puzzle feeders and interactive toys appropriate for young cats.",
          duration: "30 min",
          completed: false,
        },
      ],
    },
    {
      id: "cat-aging-gracefully",
      title: "Aging Gracefully Program",
      description: "Supporting cats through their golden years (10+ years)",
      petType: "cat",
      progress: 0,
      duration: "6 weeks",
      difficulty: "Beginner",
      lessons: [
        {
          id: "comfort-modifications",
          title: "Environmental Comfort Modifications",
          content: "Add ramps to favorite high spots and provide easily accessible litter boxes with low sides. Offer orthopedic bedding and heated beds for arthritic joints. Ensure food and water stations are easily reachable without climbing or jumping.",
          duration: "25 min",
          completed: false,
        },
        {
          id: "cognitive-stimulation",
          title: "Maintaining Mental Sharpness",
          content: "Provide age-appropriate puzzle feeders and gentle interactive play. Maintain routines while accommodating changing needs. Watch for signs of cognitive dysfunction: disorientation, excessive vocalization, or changes in sleep patterns.",
          duration: "28 min",
          completed: false,
        },
        {
          id: "health-monitoring",
          title: "Senior Health Monitoring",
          content: "Learn to recognize early signs of common senior conditions: arthritis, kidney disease, hyperthyroidism, and dental disease. Establish regular vet checkup schedules and maintain detailed health records. Adjust diet and activity levels as needed.",
          duration: "30 min",
          completed: false,
        },
      ],
    },
  ];

  const filteredCourses = courses.filter(course => course.petType === petFilter);
  const displayedCourses = filteredCourses.slice(0, 3);

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
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#221910] pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-[#f8f7f5]/80 dark:bg-[#221910]/80 p-4 pb-2 backdrop-blur-sm">
        <div className="flex size-12 shrink-0 items-center justify-start text-[#f48c25]">
          <span className="material-symbols-outlined text-4xl">pets</span>
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-tight flex-1 text-center text-slate-900 dark:text-slate-50 font-['Spline_Sans']">
          PetTraining
        </h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-slate-900 dark:text-slate-50">
            <span className="material-symbols-outlined text-2xl">person</span>
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="px-4 pt-2 pb-3">
        <div 
          className="bg-cover bg-center flex flex-col justify-between items-center overflow-hidden rounded-xl min-h-80"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuD6O3foL3vNpxucrNW-tLHhoBZ9n2AwfH60vvPIxLanla9IZeexSdBsJFFgEMH4f3CNZTkfcTAe58DvgxBD1wR-JnG7_9QBFYkLU9CJ26x2bURszfO3fld_LCS3vmKV8TAlc1pShfv0jCc0XVugmySRLf7eJOtiHBr-yE8w3asAHCMGT2MTQridRDbmQPJwBNXyFmvdFIq7eE4lIt7NUi9TDOki-xelD8hFeufPQyp26D0Dv9r9GMXGUhmnGZYjexZWBRhZ0LuRads")`
          }}
        >
          <div className="flex-1 p-6 text-center">
            <p className="text-white text-[32px] font-bold leading-tight tracking-tight drop-shadow-md font-['Spline_Sans']">
              Unlock Your Pet's Potential
            </p>
          </div>
          <div className="w-full p-4 pt-0">
            <Button
              className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-6 bg-[#f48c25] hover:bg-[#f48c25]/90 text-white text-lg font-bold leading-normal shadow-lg shadow-[#f48c25]/30 transition-transform active:scale-95"
              onClick={() => setSelectedCourse(courses.find(c => c.petType === petFilter) || courses[0])}
            >
              Start Courses
            </Button>
          </div>
        </div>
      </div>

      {/* Pet Selector Toggle */}
      <div className="flex px-4 py-3">
        <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 p-1.5">
          <button
            className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-medium leading-normal transition-all duration-200 ${
              petFilter === "dog"
                ? "bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-slate-50"
                : "text-slate-500 dark:text-slate-400"
            }`}
            onClick={() => setPetFilter("dog")}
          >
            <span className="truncate">Dog Courses</span>
          </button>
          <button
            className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-medium leading-normal transition-all duration-200 ${
              petFilter === "cat"
                ? "bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-slate-50"
                : "text-slate-500 dark:text-slate-400"
            }`}
            onClick={() => setPetFilter("cat")}
          >
            <span className="truncate">Cat Courses</span>
          </button>
        </div>
      </div>

      {/* Course Cards */}
      <div className="space-y-4 px-4">
        {displayedCourses.map((course) => (
          <div
            key={course.id}
            className="flex flex-col items-stretch justify-start rounded-xl bg-white dark:bg-slate-800 shadow-sm overflow-hidden"
          >
            <div
              className="w-full bg-center bg-no-repeat aspect-[16/7] bg-cover"
              style={{
                backgroundImage: course.petType === "dog"
                  ? 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAr_tjCxstrsAEEfSWVSgAJyg1lnpJsQDQ8VUbQUiFvFVAg6vzBCsQ_VrUbFQ1afxSNpwVz1bdkjf074H8l_TIccOXDQ_BsuRmD8DzMWpZLfuCYFM1tryMPjt9jBNzqaz03ldvK46wW_5e41ZpY6vFjrfOcYBBcfh44jCVDj6dJ-x6AcOjN9kIkWoD3Iexzz3IL6Hb78-utTbWxjmdIA0aErfBgWNxSYHLseDFBwLpGZSnKobfCmp9U3kqb7goFAa9ktrnBA7Vg82s")'
                  : 'url("https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800")'
              }}
            />
            <div className="flex w-full grow flex-col items-stretch justify-center gap-2 p-4">
              <p className="text-slate-900 dark:text-slate-50 text-xl font-bold leading-tight tracking-tight font-['Spline_Sans']">
                {course.title}
              </p>
              <div className="flex items-end gap-3 justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                    {course.description}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                    {course.difficulty}
                  </p>
                </div>
                <Button
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-[#f48c25] hover:bg-[#f48c25]/90 text-white text-sm font-bold leading-normal"
                  onClick={() => setSelectedCourse(course)}
                >
                  <span className="truncate">View</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-20 left-0 right-0 bg-[#f8f7f5]/80 dark:bg-[#221910]/80 p-4 backdrop-blur-sm max-w-md mx-auto">
        <Button
          className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-[#f48c25] hover:bg-[#f48c25]/90 text-white text-base font-bold leading-normal shadow-lg shadow-[#f48c25]/30"
          onClick={() => {
            // Show all courses or navigate to full course list
            console.log("Explore all courses");
          }}
        >
          Explore All Courses
        </Button>
      </div>
    </div>
  );
};

export default TrainingPage;