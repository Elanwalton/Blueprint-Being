'use client';

interface SocialEmbedProps {
  url: string;
}

function getEmbedType(url: string): { type: string; id: string } | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: 'youtube', id: ytMatch[1] };

  // Twitter/X
  const twMatch = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  if (twMatch) return { type: 'twitter', id: url };

  // Instagram
  const igMatch = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  if (igMatch) return { type: 'instagram', id: igMatch[1] };

  // TikTok
  const ttMatch = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
  if (ttMatch) return { type: 'tiktok', id: ttMatch[1] };

  // Facebook post/video
  if (url.includes('facebook.com')) return { type: 'facebook', id: url };

  return null;
}

export default function SocialEmbed({ url }: SocialEmbedProps) {
  const embed = getEmbedType(url);

  if (!embed) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
        Cannot embed: <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#00b4d8] underline">{url}</a>
      </div>
    );
  }

  if (embed.type === 'youtube') {
    return (
      <div className="rounded-xl overflow-hidden shadow-lg aspect-video my-6">
        <iframe
          src={`https://www.youtube.com/embed/${embed.id}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  if (embed.type === 'twitter') {
    return (
      <div className="my-6 flex justify-center">
        <blockquote className="twitter-tweet">
          <a href={embed.id}></a>
        </blockquote>
        <script async src="https://platform.twitter.com/widgets.js" />
      </div>
    );
  }

  if (embed.type === 'instagram') {
    return (
      <div className="my-6 flex justify-center">
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ maxWidth: '540px', width: '100%' }}
        />
        <script async src="https://www.instagram.com/embed.js" />
      </div>
    );
  }

  if (embed.type === 'tiktok') {
    return (
      <div className="my-6 flex justify-center">
        <blockquote
          className="tiktok-embed"
          cite={url}
          data-video-id={embed.id}
          style={{ maxWidth: '605px', width: '100%' }}
        >
          <section />
        </blockquote>
        <script async src="https://www.tiktok.com/embed.js" />
      </div>
    );
  }

  if (embed.type === 'facebook') {
    const encodedUrl = encodeURIComponent(embed.id);
    return (
      <div className="my-6 flex justify-center">
        <iframe
          src={`https://www.facebook.com/plugins/post.php?href=${encodedUrl}&width=500&show_text=true`}
          width="500"
          height="400"
          style={{ border: 'none', overflow: 'hidden' }}
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          className="rounded-xl shadow"
        />
      </div>
    );
  }

  return null;
}
