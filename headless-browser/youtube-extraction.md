# Youtube Extraction

#### Overview

greenclaw detects YouTube URLs before the standard content-type router runs. When a YouTube URL is recognized, it bypasses the normal HTML pipeline and uses a dedicated extraction path via the `kkdai/youtube/v2` library. No browser is launched for YouTube URLs.

***

#### URL Detection

YouTube URLs are identified by `router.IsYouTube()` which matches against known YouTube hosts (`youtube.com`, `www.youtube.com`, `m.youtube.com`, `youtu.be`) and classifies the URL into one of three types:

| URL Type     | Patterns                                                |
| ------------ | ------------------------------------------------------- |
| **Video**    | `/watch?v=ID`, `/shorts/ID`, `/embed/ID`, `youtu.be/ID` |
| **Playlist** | `/playlist?list=ID`                                     |
| **Channel**  | `/channel/UC...`, `/@handle`                            |

***

#### Data Flow

```
URL → router.IsYouTube
  │
  ├── Video
  │     ├── GetVideoMetadata (title, duration, views, channel, captions)
  │     ├── GetTranscript / GetAllTranscripts (if extract_transcripts enabled)
  │     ├── DownloadAudio via yt-dlp (if download_audio enabled)
  │     └── ExportSubtitles (if export_subtitles enabled)
  │
  ├── Playlist
  │     └── GetPlaylistItems (video IDs, titles, indices)
  │
  └── Channel
        └── Basic info only (channel ID / handle captured)
```

***

#### Features

**Video Metadata**

Fetches via `youtube.Client.GetVideoMetadata`:

* Video ID, title, description
* Duration, view count, upload date
* Channel name and ID
* Thumbnail URL (highest resolution available)
* Available caption tracks (language, language code, auto-generated flag)

**Transcript Extraction**

Fetches YouTube's timed text XML format and converts to plain text.

* **Single language**: `GetTranscript(ctx, video, "en")` returns one caption track
* Language filtering via `transcript_langs` config (empty = all languages)
* HTML entities are unescaped during parsing

**Audio Download**

`DownloadAudio` shells out to `yt-dlp` for reliable audio extraction. YouTube's stream URLs require anti-bot countermeasures (PO tokens, nsig deciphering) that `yt-dlp` actively maintains, making it far more reliable than direct HTTP stream downloads.

1. Requires `yt-dlp` installed and in PATH
2. Selects the best audio-only stream (`-f bestaudio`)
3. When `ffmpeg` is available: extracts and converts to opus (`-x --audio-format opus`)
4. Without `ffmpeg`: downloads in the native format (typically webm/opus)
5. Output: `<outputDir>/<videoID>.<ext>` (`.opus`, `.webm`, or `.m4a`)

**Installing yt-dlp:**

```bash
pip install yt-dlp        # via pip
brew install yt-dlp       # macOS
```

**Playlist Support**

`GetPlaylistItems` extracts all videos in a playlist, returning video ID, title, and index for each entry.

**Channel Support**

Minimal — captures channel ID or handle. Does not resolve the uploads playlist.
