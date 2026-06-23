// Sample data for Profile module screens

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
};

export const blogPosts: BlogPost[] = [
  {
    id: 'b1',
    title: '5 Tips to Stay Consistent with Your Workouts',
    excerpt: 'Consistency beats intensity. Here are five simple habits that will keep you on track.',
    content:
      'Staying consistent is the single biggest factor in long-term fitness success.\n\n1. Schedule your workouts like meetings — put them in your calendar.\n2. Start small. A 15-minute session is better than skipping entirely.\n3. Track your progress so you can see how far you have come.\n4. Find a workout buddy or community for accountability.\n5. Forgive missed days — focus on getting back on track, not on perfection.',
    date: 'June 12, 2026',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  },
  {
    id: 'b2',
    title: 'Understanding Macros: Protein, Carbs & Fats',
    excerpt: 'A simple breakdown of macronutrients and why they matter for your goals.',
    content:
      'Macronutrients are the three building blocks of every meal: protein, carbohydrates, and fats.\n\nProtein helps repair and build muscle tissue. Carbohydrates are your body\'s primary energy source, especially during workouts. Fats support hormone production and long-term energy storage.\n\nA balanced approach — rather than cutting any one macro entirely — tends to produce the best long-term results.',
    date: 'June 5, 2026',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
  },
  {
    id: 'b3',
    title: 'Why Sleep Is Your Most Underrated Recovery Tool',
    excerpt: 'You can train hard, but without sleep your progress will stall.',
    content:
      'Recovery happens while you rest, not while you train. During deep sleep, your body releases growth hormone, repairs muscle fibers, and consolidates the neural patterns built during practice.\n\nAim for 7-9 hours per night, keep a consistent sleep schedule, and avoid screens right before bed for the best recovery results.',
    date: 'May 28, 2026',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80',
  },
  {
    id: 'b4',
    title: 'Beginner Guide: How to Warm Up Properly',
    excerpt: 'Skipping the warm-up is one of the most common training mistakes.',
    content:
      'A good warm-up raises your heart rate, increases blood flow to your muscles, and prepares your joints for the work ahead.\n\nSpend 5-10 minutes on light cardio followed by dynamic stretches that mimic the movements of your workout. This simple habit reduces injury risk and improves performance.',
    date: 'May 20, 2026',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  },
];

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: '1 month',
    name: '1 Month',
    price: '$19.00',
    period: '/month',
    features: ['Full workout library', 'Personalized plans', 'Progress tracking'],
  },
  {
    id: '6 Month',
    name: '6 Month',
    price: '$79.00',
    period: '/year',
    features: ['Everything in Monthly', 'Save 33%', 'Priority support', 'Offline downloads'],
    highlighted: true,
  },
  {
    id: '1 Year',
    name: '1 Year',
    price: '$199.00',
    period: 'one-time',
    features: ['Everything in Yearly', 'Pay once, use forever', 'All future updates'],
  },
];

export type ReminderEntry = {
  id: string;
  title: string;
  time: string;
  days: string[];
  enabled: boolean;
};

export const reminderEntries: ReminderEntry[] = [
  { id: 'r1', title: 'Morning Workout', time: '07:00 AM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], enabled: true },
  { id: 'r2', title: 'Drink Water', time: '12:00 PM', days: ['Daily'], enabled: true },
  { id: 'r3', title: 'Evening Walk', time: '06:30 PM', days: ['Sat', 'Sun'], enabled: false },
];

export type AssignedExercise = {
  id: string;
  name: string;
  sets: string;
  icon: string;
};

export const assignedWorkout: AssignedExercise[] = [
  { id: 'e1', name: 'Push Ups', sets: '3 sets x 15 reps', icon: 'fitness-outline' },
  { id: 'e2', name: 'Squats', sets: '4 sets x 12 reps', icon: 'body-outline' },
  { id: 'e3', name: 'Plank', sets: '3 sets x 45 sec', icon: 'timer-outline' },
  { id: 'e4', name: 'Lunges', sets: '3 sets x 10 reps', icon: 'walk-outline' },
];

export type AssignedMeal = {
  id: string;
  type: string;
  name: string;
  calories: number;
};

export const assignedDiet: AssignedMeal[] = [
  { id: 'm1', type: 'Breakfast', name: 'Oats with banana & almonds', calories: 320 },
  { id: 'm2', type: 'Lunch', name: 'Grilled chicken with brown rice', calories: 480 },
  { id: 'm3', type: 'Snack', name: 'Greek yogurt with honey', calories: 180 },
  { id: 'm4', type: 'Dinner', name: 'Salmon with steamed vegetables', calories: 410 },
];

export type Language = { code: string; name: string; nativeName: string };

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ur', name: 'Urdu', nativeName: 'Hindi' },
  { code: 'ar', name: 'Arabic', nativeName: 'French' },
  { code: 'es', name: 'Spanish', nativeName: 'German' },
  { code: 'fr', name: 'French', nativeName: 'Spanish' },
];
