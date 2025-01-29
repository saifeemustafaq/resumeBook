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
import { LinkedIn, Description } from '@mui/icons-material';

interface StudentCardProps {
  profilePic: string;
  name: string;
  gpa: number;
  school: string;
  experience: string;
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
        width: 300,
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        }
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 64, height: 64, position: 'relative' }}>
            <Image
              src={profilePic}
              alt={`${name}'s profile picture`}
              fill
              sizes="(max-width: 64px) 100vw"
              style={{ 
                borderRadius: '8px',
                objectFit: 'cover'
              }}
            />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" noWrap sx={{ fontWeight: 600, mb: 0.5 }}>
              {name}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {school}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <Grid container spacing={2} sx={{ px: 0.5 }}>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 600, display: 'block', mb: 0.5 }}>GPA</Box>
              {gpa}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 600, display: 'block', mb: 0.5 }}>YOE</Box>
              {experience}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 600, display: 'block', mb: 0.5 }}>Grad</Box>
              {graduationDate}
            </Typography>
          </Grid>
        </Grid>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
            minHeight: '4.5em'
          }}
        >
          {bio}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
          <Button
            href={resumeLink}
            variant="contained"
            fullWidth
            size="medium"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<Description />}
            sx={{ 
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            Resume
          </Button>
          <Button
            href={linkedinUrl}
            variant="outlined"
            fullWidth
            size="medium"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<LinkedIn />}
            sx={{ 
              fontWeight: 600,
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