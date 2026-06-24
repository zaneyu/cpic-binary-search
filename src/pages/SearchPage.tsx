import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { BinarySearchView } from './BinarySearchView'
import { BstaView } from './BstaView'

type Surface = 'search' | 'bsta'

const triggerCls =
  'h-auto flex-none px-3.5 py-2 font-mono text-[13px] text-text-muted after:bg-primary data-[state=active]:text-primary dark:data-[state=active]:text-primary'

export function SearchPage() {
  const [tab, setTab] = useState<Surface>('search')
  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Surface)} className="space-y-5">
      <TabsList variant="line" aria-label="Surface" className="h-auto w-full justify-start gap-1 border-b border-line-strong">
        <TabsTrigger value="search" className={triggerCls}>
          Binary search
        </TabsTrigger>
        <TabsTrigger value="bsta" className={triggerCls}>
          Binary search the answer
        </TabsTrigger>
      </TabsList>
      {/* forceMount keeps both views mounted so their state persists across switches */}
      <TabsContent value="search" forceMount hidden={tab !== 'search'}>
        <BinarySearchView active={tab === 'search'} />
      </TabsContent>
      <TabsContent value="bsta" forceMount hidden={tab !== 'bsta'}>
        <BstaView active={tab === 'bsta'} />
      </TabsContent>
    </Tabs>
  )
}
