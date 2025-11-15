import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import PersonaliseForm from "./personalise-form";

export default async function PersonalisePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-100 to-blue-200 text-gray-900 py-12 px-4 mt-[80px]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Customize Your Experience
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help us understand your preferences so we can create the perfect
            personalized products for you.
          </p>
        </div>
        <PersonaliseForm userSession={session} />
      </div>
    </div>
  );
}
