import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/use-auth'
import { HrApiClient } from '@/lib/hr-api'
import type {
  CreateVacancyRequest,
  UpdateVacancyRequest,
  CreateResumeRequest,
  UpdateResumeRequest,
  CreateMatchRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  SendEmailRequest,
  CreateSalaryReportRequest,
} from '@hr-recruiter/contracts'

export function useHrClient() {
  const auth = useAuth()
  return useMemo(() => new HrApiClient(() => auth.accessToken, 'web'), [auth.accessToken])
}

// Vacancies
export function useVacancies() {
  const client = useHrClient()
  return useQuery({
    queryKey: ['vacancies'],
    queryFn: () => client.getVacancies(),
    enabled: !!useAuth().accessToken,
  })
}

export function useCreateVacancy() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVacancyRequest) => client.createVacancy(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vacancies'] }),
  })
}

export function useUpdateVacancy() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVacancyRequest }) => client.updateVacancy(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vacancies'] }),
  })
}

export function useDeleteVacancy() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.deleteVacancy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vacancies'] }),
  })
}

// Resumes
export function useResumes() {
  const client = useHrClient()
  return useQuery({
    queryKey: ['resumes'],
    queryFn: () => client.getResumes(),
    enabled: !!useAuth().accessToken,
  })
}

export function useCreateResume() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateResumeRequest) => client.createResume(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  })
}

export function useUpdateResume() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResumeRequest }) => client.updateResume(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  })
}

export function useDeleteResume() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.deleteResume(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  })
}

// Matches
export function useMatches() {
  const client = useHrClient()
  return useQuery({
    queryKey: ['matches'],
    queryFn: () => client.getMatches(),
    enabled: !!useAuth().accessToken,
  })
}

export function useCreateMatch() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMatchRequest) => client.createMatch(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  })
}

export function useUpdateMatch() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => client.updateMatch(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  })
}

// Tasks
export function useTasks() {
  const client = useHrClient()
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => client.getTasks(),
    enabled: !!useAuth().accessToken,
  })
}

export function useUpcomingTasks() {
  const client = useHrClient()
  return useQuery({
    queryKey: ['tasks', 'upcoming'],
    queryFn: () => client.getUpcomingTasks(),
    enabled: !!useAuth().accessToken,
  })
}

export function useCreateTask() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => client.createTask(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['tasks', 'upcoming'] })
    },
  })
}

export function useUpdateTask() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) => client.updateTask(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['tasks', 'upcoming'] })
    },
  })
}

export function useDeleteTask() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['tasks', 'upcoming'] })
    },
  })
}

// Digest
export function useDailyDigest() {
  const client = useHrClient()
  return useQuery({
    queryKey: ['digest', 'daily'],
    queryFn: () => client.getDailyDigest(),
    enabled: !!useAuth().accessToken,
  })
}

// Salary Reports
export function useSalaryReports() {
  const client = useHrClient()
  return useQuery({
    queryKey: ['salary', 'reports'],
    queryFn: () => client.getSalaryReports(),
    enabled: !!useAuth().accessToken,
  })
}

export function useCreateSalaryReport() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSalaryReportRequest) => client.createSalaryReport(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salary', 'reports'] }),
  })
}

// Email
export function useSendEmail() {
  const client = useHrClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SendEmailRequest) => client.sendEmail(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emails'] }),
  })
}

// Agent Chat
export function useAgentConfigs() {
  const client = useHrClient()
  return useQuery({
    queryKey: ['agent-configs'],
    queryFn: () => client.getAgentConfigs(),
    enabled: !!useAuth().accessToken,
  })
}

export function useAgentChat() {
  const client = useHrClient()
  return useMutation({
    mutationFn: (data: { agentId: string; messages: { role: string; content: string }[]; vacancyId?: string; resumeId?: string }) =>
      client.chatWithAgent(data),
  })
}

export function useAnalyzeMatchLLM() {
  const client = useHrClient()
  return useMutation({
    mutationFn: (data: {
      vacancy: { title: string; company?: string; location?: string; salaryFrom?: number; salaryTo?: number; description?: string; requirements?: string[] }
      resume: { fullName: string; position?: string; skills?: string[]; experience?: string; education?: string; salary?: string }
    }) => client.analyzeMatchLLM(data),
  })
}


