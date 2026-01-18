# Smart Videos

use youtube-transcript-api&#x20;

Manual Transcripts (`is_generated=False`): NEVER use fallback. These were uploaded by the creator and are the gold standard.

Auto-Generated (`is_generated=True`): This is where you have to decide. If it’s a simple vlog, keep it. If it’s a medical lecture or has heavy accents, consider the fallback.

then fallback to yt-dlp openai-whisper

then we generate the knowledge graph using [https://github.com/getzep/graphiti](https://github.com/getzep/graphiti)

