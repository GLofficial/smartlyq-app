import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Image, Film, X, GripVertical, Play, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
}

interface MediaManagerProps {
  media: MediaItem[];
  onMediaChange: (media: MediaItem[]) => void;
}

export function PostMediaManager({ media, onMediaChange }: MediaManagerProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [selectedPickerItems, setSelectedPickerItems] = useState<number[]>([]);
  const [thumbnailPickerOpen, setThumbnailPickerOpen] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState<number | null>(null);

  const hasVideos = media.some((m) => m.type === "video");

  const removeMedia = (idx: number) => onMediaChange(media.filter((_, i) => i !== idx));
  const clearMedia = () => onMediaChange([]);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const items = [...media];
    const moved = items.splice(dragIdx, 1)[0]!;
    items.splice(idx, 0, moved);
    onMediaChange(items);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const addImages = () => {
    selectedPickerItems.forEach((_, idx) => {
      const newItem: MediaItem = { id: `img-${media.length + idx + 1}`, url: "", type: "image", name: `image-${media.length + idx + 1}.jpg` };
      onMediaChange([...media, newItem]);
    });
    setImagePickerOpen(false);
    setSelectedPickerItems([]);
  };

  const addVideos = () => {
    selectedPickerItems.forEach((_, idx) => {
      const newItem: MediaItem = { id: `vid-${media.length + idx + 1}`, url: "", type: "video", name: `video-${media.length + idx + 1}.mp4` };
      onMediaChange([...media, newItem]);
    });
    setVideoPickerOpen(false);
    setSelectedPickerItems([]);
  };

  return (
    <>
      {/* Media grid */}
      {media.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Media ({media.length})</h3>
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={clearMedia}>
              <Trash2 className="w-3 h-3" /> Clear all
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {media.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "relative aspect-square rounded-lg bg-muted overflow-hidden border-2 transition-all group cursor-grab active:cursor-grabbing",
                  dragIdx === idx ? "border-primary opacity-50" : "border-transparent",
                )}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {item.type === "video" ? <Film className="w-6 h-6 text-muted-foreground/30" /> : <Image className="w-6 h-6 text-muted-foreground/30" />}
                </div>
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-foreground/50 flex items-center justify-center">
                      <Play className="w-4 h-4 text-card ml-0.5" />
                    </div>
                  </div>
                )}
                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-card drop-shadow" />
                </div>
                <button onClick={() => removeMedia(idx)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-foreground/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3 text-card" />
                </button>
                <span className="absolute bottom-1 left-1 right-1 text-[9px] text-card truncate bg-foreground/40 px-1 rounded">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Thumbnail Picker (shown when video is uploaded) */}
      {hasVideos && (
        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Video Thumbnail</h3>
            </div>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setThumbnailPickerOpen(true)}>
              <Play className="w-3 h-3" /> Pick thumbnail
            </Button>
          </div>
          <div className="px-5 pb-4">
            <p className="text-xs text-muted-foreground mb-3">{selectedThumbnail !== null ? `Frame ${selectedThumbnail + 1} selected` : "Auto-generated"}</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <button key={i} onClick={() => setSelectedThumbnail(i)} className={cn("shrink-0 w-16 h-10 rounded bg-muted flex items-center justify-center text-[9px] text-muted-foreground border-2 transition-colors", selectedThumbnail === i ? "border-primary" : "border-transparent hover:border-primary/30")}>
                  0:{String((i + 1) * 4).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Picker Dialog */}
      <Dialog open={thumbnailPickerOpen} onOpenChange={setThumbnailPickerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Thumbnail picker</DialogTitle></DialogHeader>
          <div className="grid grid-cols-[250px_1fr] gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Custom thumbnail</h4>
                <p className="text-xs text-muted-foreground mb-3">Upload your own or select one from the video.</p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full text-xs">Upload your own</Button>
                  <Button variant="outline" size="sm" className="w-full text-xs">Select from Library</Button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Choose frame from video</h4>
                <Button className="w-full text-xs">Capture current frame</Button>
              </div>
            </div>
            <div>
              <div className="bg-foreground rounded-lg flex items-center justify-center text-card/30" style={{ aspectRatio: "16/9" }}>
                <div className="text-center"><Play className="w-10 h-10 mx-auto mb-2 opacity-40" /><span className="text-xs">Video preview</span></div>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-foreground mb-2">Custom thumbnail</p>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <button key={i} onClick={() => setSelectedThumbnail(i)} className={cn("w-16 h-10 rounded bg-muted flex items-center justify-center text-[9px] text-muted-foreground border-2 transition-colors", selectedThumbnail === i ? "border-primary" : "border-transparent hover:border-primary/30")}>
                      0/{String((i + 1) * 4).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setThumbnailPickerOpen(false)}>Cancel</Button>
            <Button onClick={() => setThumbnailPickerOpen(false)}>Save and update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Picker Dialog */}
      <Dialog open={imagePickerOpen} onOpenChange={setImagePickerOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Images</DialogTitle>
            <p className="text-sm text-muted-foreground">You can select up to 10 images</p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4">
            <button className="w-full border-2 border-dashed border-primary/40 rounded-xl p-8 text-center text-muted-foreground hover:border-primary/60 hover:bg-primary/5 transition-colors cursor-pointer">
              <Image className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-foreground">Drop or Select image file</p>
              <p className="text-xs mt-1">Drop image files here or click browse</p>
            </button>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, i) => {
                const isSelected = selectedPickerItems.includes(i);
                return (
                  <button key={i} onClick={() => setSelectedPickerItems((prev) => isSelected ? prev.filter((x) => x !== i) : prev.length < 10 ? [...prev, i] : prev)} className={cn("relative aspect-square rounded-lg bg-muted overflow-hidden border-2 transition-all hover:opacity-80", isSelected ? "border-primary ring-1 ring-primary" : "border-transparent")}>
                    <div className="w-full h-full flex items-center justify-center"><Image className="w-8 h-8 text-muted-foreground/30" /></div>
                    <div className={cn("absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", isSelected ? "bg-primary border-primary" : "border-muted-foreground/40 bg-card/80")}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <DialogFooter className="border-t border-border pt-4">
            <Button variant="outline" className="text-destructive border-destructive/30" onClick={() => setImagePickerOpen(false)}>Cancel</Button>
            <Button disabled={selectedPickerItems.length === 0} onClick={addImages}>Add to Post {selectedPickerItems.length > 0 && `(${selectedPickerItems.length})`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Picker Dialog */}
      <Dialog open={videoPickerOpen} onOpenChange={setVideoPickerOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Videos</DialogTitle>
            <p className="text-sm text-muted-foreground">You can select up to 10 videos</p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4">
            <button className="w-full border-2 border-dashed border-primary/40 rounded-xl p-8 text-center text-muted-foreground hover:border-primary/60 hover:bg-primary/5 transition-colors cursor-pointer">
              <Film className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-foreground">Drop or Select video file</p>
              <p className="text-xs mt-1">Drop video files here or click browse</p>
            </button>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, i) => {
                const isSelected = selectedPickerItems.includes(i);
                return (
                  <button key={i} onClick={() => setSelectedPickerItems((prev) => isSelected ? prev.filter((x) => x !== i) : prev.length < 10 ? [...prev, i] : prev)} className={cn("relative aspect-square rounded-lg bg-muted overflow-hidden border-2 transition-all hover:opacity-80", isSelected ? "border-primary ring-1 ring-primary" : "border-transparent")}>
                    <div className="w-full h-full flex items-center justify-center"><Film className="w-6 h-6 text-muted-foreground/30" /></div>
                    <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-foreground/50 flex items-center justify-center"><Play className="w-4 h-4 text-card ml-0.5" /></div></div>
                    <div className={cn("absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", isSelected ? "bg-primary border-primary" : "border-muted-foreground/40 bg-card/80")}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <DialogFooter className="border-t border-border pt-4">
            <Button variant="outline" className="text-destructive border-destructive/30" onClick={() => setVideoPickerOpen(false)}>Cancel</Button>
            <Button disabled={selectedPickerItems.length === 0} onClick={addVideos}>Add to Post {selectedPickerItems.length > 0 && `(${selectedPickerItems.length})`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
