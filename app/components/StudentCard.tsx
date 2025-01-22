import Image from 'next/image';

interface StudentCardProps {
  profilePic: string;
  name: string;
  gpa: number;
  school: string;
  experience: number;
  graduationDate: string;
  bio: string;
  resumeLink: string;
  linkedinUrl: string;
}

export default function StudentCard({
  profilePic,
  name,
  gpa,
  school,
  experience,
  graduationDate,
  bio,
  resumeLink,
  linkedinUrl,
}: StudentCardProps) {
  return (
    <div className="aspect-square w-[250px] bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 border border-gray-200 dark:border-gray-700">
          <Image
            src={profilePic}
            alt={`${name}'s profile picture`}
            width={48}
            height={48}
            className="rounded-none object-cover w-full h-full"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold truncate">{name}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{school}</p>
        </div>
      </div>
      
      <div className="flex justify-between text-[11px] px-1">
        <div className="truncate">
          <span className="font-medium">GPA:</span> {gpa}
        </div>
        <div className="truncate">
          <span className="font-medium">YOE:</span> {experience}y
        </div>
        <div className="truncate">
          <span className="font-medium">Grad:</span> {graduationDate}
        </div>
      </div>
      
      <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-3 flex-grow">
        {bio}
      </p>
      
      <div className="flex gap-1.5 mt-auto">
        <a
          href={resumeLink}
          className="flex-1 bg-blue-600 text-white rounded px-2 py-0.5 text-center text-[11px] hover:bg-blue-700 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume
        </a>
        <a
          href={linkedinUrl}
          className="flex-1 border border-blue-600 text-blue-600 rounded px-2 py-0.5 text-center text-[11px] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
} 