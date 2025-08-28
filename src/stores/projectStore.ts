// Extended projectStore to manage full project lists and optimistic updates
import { create } from 'zustand';
import { Project } from '@/models/';

interface ProjectState {
  selectedProject: Project | null;
  unconnectedProjects: Project[];
  connectedProjects: Project[];
  loading: boolean;
  setSelectedProject: (project: Project | null) => void;
  setUnconnectedProjects: (projects: Project[]) => void;
  setConnectedProjects: (projects: Project[]) => void;
  setLoading: (loading: boolean) => void;
  addProjectToUnconnectedList: (project: Project) => void;
  addProjectToConnectedList: (project: Project) => void;
  replaceOptimisticProject: (optimisticId: number, realProject: Project) => void;
  removeProjectFromUnconnected: (projectId: number) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  selectedProject: null,
  unconnectedProjects: [],
  connectedProjects: [],
  loading: false,
  setSelectedProject: (project) => set({ selectedProject: project }),
  setUnconnectedProjects: (projects) => set({ unconnectedProjects: projects }),
  setConnectedProjects: (projects) => set({ connectedProjects: projects }),
  setLoading: (loading) => set({ loading }),
  // Optimistic update function to add new project to unconnected list
  addProjectToUnconnectedList: (project) => set((state) => ({
    unconnectedProjects: [...state.unconnectedProjects, project]
  })),
  // Optimistic update function to add new project to connected list
  addProjectToConnectedList: (project) => set((state) => ({
    connectedProjects: [...state.connectedProjects, project]
  })),
  // Replace optimistic project with real one from server
  replaceOptimisticProject: (optimisticId, realProject) => set((state) => ({
    unconnectedProjects: state.unconnectedProjects.map(project => 
      project.id === optimisticId ? realProject : project
    )
  })),
  // Remove project from unconnected list (for rollback on failure)
  removeProjectFromUnconnected: (projectId) => set((state) => ({
    unconnectedProjects: state.unconnectedProjects.filter(project => 
      project.id !== projectId
    )
  })),
}));