import { GameStatePlaying } from 'hathora-et-labora-game'

import { useInstanceContext } from '@/context/InstanceContext'
import classes from './actions.module.css'
import { ActionWithLaybrother } from './actionWithLaybrother'
import { ActionWithPrior } from './actionWithPrior'
import { ActionCutPeat } from './actionCutPeat'
import { ActionFellTrees } from './actionFellTrees'
import { ActionBuild } from './actionBuild'
import { ActionUse } from './actionUse'
import { ActionWorkContract } from './actionWorkContract'
import { ActionBuyPlot } from './actionBuyPlot'
import { ActionBuyDistrict } from './actionBuyDistrict'
import { ActionConvert } from './actionConvert'
import { ActionSettle } from './actionSettle'

export const Actions = () => {
  const { controls, state, partial, clearPartial } = useInstanceContext()
  const completion = controls?.completion ?? []

  const handleClear = () => {
    clearPartial()
  }

  const handleSend = () => {
    if (partial) {
      // setPartial('')
    }
  }

  return (
    <>
      <div>
        Partial ({partial.length}): {partial.join(' ')}
        <button type="button" onClick={handleClear}>
          &#x25C3;
        </button>
      </div>
      <div className={classes.container}>
        {completion?.includes('WITH_LAYBROTHER') === true && (
          <>
            <ActionWithLaybrother />
            <ActionWithPrior />
          </>
        )}
        {completion?.includes('WITH_LAYBROTHER') === false && (
          <>
            <ActionCutPeat />
            <ActionFellTrees />
            <ActionBuild />
            <ActionUse />
            <ActionWorkContract />
            <ActionBuyPlot />
            <ActionBuyDistrict />
            <ActionConvert />
            <ActionSettle />
          </>
        )}

        {/* {partial === '' && (
          <>
            <button type="button" className={classes.action} onClick={() => setPartial('')}>
              Clear
            </button>
            <div>
              <code>{partial}</code>
              Picker
            </div>
            <button
              type="button"
              disabled={!completion?.includes('')}
              className={`primary ${classes.action}`}
              onClick={handleSend}
            >
              Send Move
            </button>
          </>
        )} */}
      </div>
    </>
  )
}
