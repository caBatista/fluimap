'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { SurveyList } from '@/components/surveys/survey-list';
import { SurveysHeader } from '@/components/surveys/surveys-header';
import { SurveysTablist } from '@/components/surveys/surveys-tablist';
import { SearchAndFilter } from '@/components/surveys/search-and-filter';

type Survey = {
  _id: string;
  title: string;
  description?: string;
  status: 'ativo' | 'fechado';
  teamId: string;
  dateClosing?: string;
};

const surveysSchema = z.object({
  surveys: z.array(
    z.object({
      _id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      status: z.enum(['ativo', 'fechado']),
      teamId: z.string(),
      dateClosing: z.string().optional(),
    })
  ),
});

export default function CreateSurveyPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [activeTab, setActiveTab] = useState<'todos' | 'ativo' | 'fechado'>('todos');

  const { data: surveys = [], isLoading } = useQuery<Survey[]>({
    queryKey: ['surveys'],
    queryFn: async () => {
      const response = await fetch('/api/surveys');
      const json: unknown = await response.json();

      const parsed = surveysSchema.safeParse(json);
      if (!parsed.success) {
        console.error(parsed.error);
        throw new Error('Invalid response structure');
      }

      return parsed.data.surveys;
    },
  });

  return (
    <div className="flex min-h-screen flex-col px-8 py-4">
      <SurveysHeader />
      <SearchAndFilter
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <SurveysTablist
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setStatusFilter={setStatusFilter}
      />
      <div className="mt-6">
        <SurveyList
          surveys={surveys}
          search={search}
          statusFilter={statusFilter}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
