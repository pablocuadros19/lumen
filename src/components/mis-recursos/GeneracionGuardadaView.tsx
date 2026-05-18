'use client'

import AdaptedResourceView from '@/components/copilot/AdaptedResourceView'
import SimilarActivitiesView from '@/components/copilot/SimilarActivitiesView'
import EvaluationMaterialView from '@/components/copilot/EvaluationMaterialView'
import ImplementationGuideView from '@/components/copilot/ImplementationGuideView'
import type {
  AdaptedResource,
  SimilarActivity,
  EvaluationMaterial,
  ImplementationGuide,
} from '@/types/copilot'

type CopilotFunctionKey = 'adapt' | 'similar' | 'evaluate' | 'guide'

export default function GeneracionGuardadaView({
  funcion,
  data,
}: {
  funcion: CopilotFunctionKey
  data:    unknown
}) {
  return (
    <div className="space-y-4">
      {funcion === 'adapt'    && <AdaptedResourceView    data={data as AdaptedResource} />}
      {funcion === 'similar'  && <SimilarActivitiesView  data={data as { actividades: SimilarActivity[]; meta: { generation_id: string } }} />}
      {funcion === 'evaluate' && <EvaluationMaterialView data={data as EvaluationMaterial} />}
      {funcion === 'guide'    && <ImplementationGuideView data={data as ImplementationGuide} />}
    </div>
  )
}
