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
    <div className="aspect-square w-[250px] bg-card text-card-foreground rounded-lg shadow-sm border border-border p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 border border-border">
          <Image
            src={profilePic}
            alt={`${name}'s profile picture`}
            width={48}
            height={48}
            className="rounded-none object-cover w-full h-full"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold truncate text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground truncate">{school}</p>
        </div>
      </div>
      
      <div className="flex justify-between text-[11px] px-1 text-muted-foreground">
        <div className="truncate">
          <span className="font-medium text-foreground">GPA:</span> {gpa}
        </div>
        <div className="truncate">
          <span className="font-medium text-foreground">YOE:</span> {experience}y
        </div>
        <div className="truncate">
          <span className="font-medium text-foreground">Grad:</span> {graduationDate}
        </div>
      </div>
      
      <p className="text-[11px] text-muted-foreground line-clamp-3 flex-grow">
        {bio}
      </p>
      
      <div className="flex gap-1.5 mt-auto">
        <a
          href={resumeLink}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-2 py-0.5 text-center text-[11px] transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume
        </a>
        <a
          href={linkedinUrl}
          className="flex-1 border border-primary text-primary hover:bg-primary/10 rounded-md px-2 py-0.5 text-center text-[11px] transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
} 