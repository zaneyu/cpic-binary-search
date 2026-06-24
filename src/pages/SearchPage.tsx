import { useState } from 'react'
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
        panelId={(v) => `panel-surface-${v}`}
        options={[
          { value: 'search', label: 'Binary search' },
          { value: 'bsta', label: 'Binary search the answer' },
        ]}
      />
      {/* keep both mounted so state persists; gate keyboard via `active` */}
      <div
        id="panel-surface-search"
        role="tabpanel"
        aria-labelledby="tab-surface-search"
        hidden={tab !== 'search'}
      >
        <BinarySearchView active={tab === 'search'} />
      </div>
      <div id="panel-surface-bsta" role="tabpanel" aria-labelledby="tab-surface-bsta" hidden={tab !== 'bsta'}>
        <BstaView active={tab === 'bsta'} />
      </div>
    </div>
  )
}
