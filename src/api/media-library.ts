import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface MediaFile { id: number; name: string; url: string; type: string; size: number; folder_id: number; created_at: string | null; }
export interface MediaFolder { id: number; name: string; parent_id: number; }

const inv = () => queryClient.invalidateQueries({ queryKey: ["media"] });

export function useMediaList(folderId = 0, type = "", search = "", page = 1) {
	return useQuery({
		queryKey: ["media", "list", folderId, type, search, page],
		queryFn: () => apiClient.get<{ files: MediaFile[]; total: number; page: number; pages: number }>(
			`/api/spa/media/list?folder_id=${folderId}&type=${encodeURIComponent(type)}&search=${encodeURIComponent(search)}&page=${page}`),
	});
}

export function useMediaUpload() {
	return useMutation({
		mutationFn: (data: { file: File; folder_id?: number }) => {
			const fd = new FormData();
			fd.append("file", data.file);
			if (data.folder_id) fd.append("folder_id", String(data.folder_id));
			return apiClient.upload<{ message: string; id: number; url: string; type: string }>("/api/spa/media/upload", fd);
		},
		onSuccess: inv,
	});
}

export function useMediaDelete() {
	return useMutation({ mutationFn: (id: number) => apiClient.post<{ message: string }>("/api/spa/media/delete", { id }), onSuccess: inv });
}

export function useMediaRename() {
	return useMutation({ mutationFn: (data: { id: number; name: string }) => apiClient.post<{ message: string }>("/api/spa/media/rename", data), onSuccess: inv });
}

export function useMediaMove() {
	return useMutation({ mutationFn: (data: { id: number; folder_id: number }) => apiClient.post<{ message: string }>("/api/spa/media/move", data), onSuccess: inv });
}

export function useMediaFolders() {
	return useQuery({
		queryKey: ["media", "folders"],
		queryFn: () => apiClient.get<{ folders: MediaFolder[] }>("/api/spa/media/folders"),
	});
}

export function useMediaFolderCreate() {
	return useMutation({ mutationFn: (data: { name: string; parent_id?: number }) => apiClient.post<{ message: string; id: number }>("/api/spa/media/folders/create", data), onSuccess: inv });
}

export function useMediaFolderDelete() {
	return useMutation({ mutationFn: (id: number) => apiClient.post<{ message: string }>("/api/spa/media/folders/delete", { id }), onSuccess: inv });
}
