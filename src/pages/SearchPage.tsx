import { useState } from 'react'
import { cn } from '../lib/cn'
import { Segmented } from '../components/ui/controls'
import { BinarySearchView } from './BinarySearchView'
import { BstaView } from './BstaView'

type Surface = 'search' | 'bsta'

export function SearchPage() {
  const [tab, setTab] = useState<Surface>('search')
  return (
    <div className="space-y-5">
      <Segmented<Surface>
        groupId="surface"
        ariaLabel="Surface"
        className="w-full justify-start sm:w-auto"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'search', label: 'Binary search' },
          { value: 'bsta', label: 'Binary search the answer' },
        ]}
      />
      {/* keep both mounted so state persists; gate keyboard via `active` */}
      <div className={cn(tab !== 'search' && 'hidden')}>
        <BinarySearchView active={tab === 'search'} />
      </div>
      <div className={cn(tab !== 'bsta' && 'hidden')}>
        <BstaView active={tab === 'bsta'} />
      </div>
    </div>
  )
}
