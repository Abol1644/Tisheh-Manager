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
  replaceProject: (updatedProject: Project) => void;
  eraseProject: (projectId: number) => void;
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
  // Add new project to unconnected list after successful API call
  addProjectToUnconnectedList: (project) => set((state) => ({
    unconnectedProjects: [...state.unconnectedProjects, project]
  })),
  // Add new project to connected list after successful API call
  addProjectToConnectedList: (project) => set((state) => ({
    connectedProjects: [...state.connectedProjects, project]
  })),
  // Replace/overwrite existing project in both lists after successful edit API call
  replaceProject: (updatedProject) => set((state) => ({
    unconnectedProjects: state.unconnectedProjects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ),
    connectedProjects: state.connectedProjects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ),
    selectedProject: state.selectedProject?.id === updatedProject.id ? updatedProject : state.selectedProject
  })),
  // Delete project from both lists after successful delete API call
  eraseProject: (projectId) => set((state) => ({
    unconnectedProjects: state.unconnectedProjects.filter(p => p.id !== projectId),
    connectedProjects: state.connectedProjects.filter(p => p.id !== projectId),
    selectedProject: state.selectedProject?.id === projectId ? null : state.selectedProject
  })),
}));