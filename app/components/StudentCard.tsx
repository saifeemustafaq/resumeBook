import Image from 'next/image';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Avatar,
  Divider
} from '@mui/material';

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
    <Card 
      sx={{ 
        width: 250,
        height: 250,
        display: 'flex',
        flexDirection: 'column',
        p: 1.5
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 48, height: 48, position: 'relative' }}>
            <Image
              src={profilePic}
              alt={`${name}'s profile picture`}
              fill
              sizes="(max-width: 48px) 100vw"
              style={{ 
                borderRadius: '4px',
                objectFit: 'cover'
              }}
            />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {school}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={1} sx={{ px: 0.5, fontSize: '0.6875rem' }}>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>GPA:</Box> {gpa}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>YOE:</Box> {experience}y
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>Grad:</Box> {graduationDate}
            </Typography>
          </Grid>
        </Grid>

        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1
          }}
        >
          {bio}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            href={resumeLink}
            variant="contained"
            fullWidth
            size="small"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              fontSize: '0.6875rem',
              textTransform: 'none'
            }}
          >
            Resume
          </Button>
          <Button
            href={linkedinUrl}
            variant="outlined"
            fullWidth
            size="small"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              fontSize: '0.6875rem',
              textTransform: 'none'
            }}
          >
            LinkedIn
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
} 