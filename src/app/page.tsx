import { PostForm } from '@/components/post-form';
import { PostList } from '@/components/post-list';
import { auth, currentUser } from '@clerk/nextjs/server';
import User from '@/models/User';
import dbConnect from '@/server/database/db';

async function createUser(clerkId: string, name: string | null) {
  const user = await User.findOne({ clerkId });
  if (!user) {
    await User.create({ clerkId, name });
  }
}

export default async function Home() {
  await dbConnect();

  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();

  const user = await currentUser();

  if (user === null) return redirectToSignIn();

  await createUser(user.id, user.firstName);

  return (
    <main className="container mx-auto flex flex-col items-center">
      <h1 className="text-4xl font-bold">Welcome to FluiMap</h1>
      <PostForm />
      <div className="p-4" />
      <PostList />
    </main>
  );
}
