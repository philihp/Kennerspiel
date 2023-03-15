import { pipe } from 'ramda'
import { match } from 'ts-pattern'
import { oncePerFrame, withFrame } from '../board/frame'
import { moveClergyInBonusRoundTo, moveClergyToOwnBuilding } from '../board/landscape'
import {
  bakery,
  bathhouse,
  brewery,
  buildersMarket,
  calefactory,
  carpentry,
  castle,
  chamberOfWonders,
  clayMound,
  cloisterChapterHouse,
  cloisterChurch,
  cloisterCourtyard,
  cloisterGarden,
  cloisterLibrary,
  cloisterOffice,
  cloisterWorkshop,
  dormitory,
  estate,
  farmyard,
  falseLighthouse,
  financedEstate,
  forgersWorkshop,
  fuelMerchant,
  grainStorage,
  grapevine,
  harborPromenade,
  hospice,
  houseboat,
  houseOfTheBrotherhood,
  inn,
  malthouse,
  market,
  palace,
  peatCoalKiln,
  pilgrimageSite,
  printingOffice,
  priory,
  quarry,
  sacristy,
  shippingCompany,
  shipyard,
  slaughterhouse,
  spinningMill,
  stoneMerchant,
  townEstate,
  windmill,
  winery,
  cottage,
  granary,
  sacredSite,
  scriptorium,
  whiskeyDistillery,
} from '../buildings'
import { BuildingEnum, GameCommandEnum, NextUseClergy, StateReducer } from '../types'

const checkIfUseCanHappen =
  (building: BuildingEnum): StateReducer =>
  (state) => {
    if (state === undefined) return undefined

    // try to consume bonusAction and mainAction first
    const usedAction = oncePerFrame(GameCommandEnum.USE)(state)
    if (usedAction) return usedAction

    // but if mainActionUsed and bonusAction don't allow, still it is possible to use if
    // usableBuildings allows AND the building in question isn't in unusableBuildings
    if (
      state.frame.usableBuildings.includes(building) === true &&
      state.frame.unusableBuildings.includes(building) === false &&
      [NextUseClergy.Free, NextUseClergy.OnlyPrior].includes(state.frame.nextUse)
    ) {
      return state
    }

    // otherwise dont allow
    return undefined
  }

const clearUsableBuildings: StateReducer = withFrame((frame) => ({
  ...frame,
  usableBuildings: [],
}))

const moveClergyTo =
  (building: BuildingEnum): StateReducer =>
  (state) => {
    if (state === undefined) return undefined
    if (state.frame.bonusRoundPlacement) return moveClergyInBonusRoundTo(building)(state)
    return moveClergyToOwnBuilding(building)(state)
  }

export const use = (building: BuildingEnum, params: string[]): StateReducer =>
  pipe(
    checkIfUseCanHappen(building),
    moveClergyTo(building),
    clearUsableBuildings,
    match<BuildingEnum, StateReducer>(building)
      .with(BuildingEnum.Bakery, () => bakery(params[0]))
      .with(BuildingEnum.Bathhouse, () => bathhouse(params[0]))
      .with(BuildingEnum.Brewery, () => brewery(params[0]))
      .with(BuildingEnum.BuildersMarket, () => buildersMarket(params[0]))
      .with(BuildingEnum.Calefactory, () => calefactory(params[0]))
      .with(BuildingEnum.Carpentry, () =>
        carpentry(Number.parseInt(params[0] ?? '', 10), Number.parseInt(params[1] ?? '', 10))
      )
      .with(BuildingEnum.Castle, castle)
      .with(BuildingEnum.ChamberOfWonders, () => chamberOfWonders(params[0]))
      .with(BuildingEnum.ClayMoundR, BuildingEnum.ClayMoundG, BuildingEnum.ClayMoundB, BuildingEnum.ClayMoundW, () =>
        clayMound(params[0])
      )
      .with(BuildingEnum.CloisterChapterHouse, cloisterChapterHouse)
      .with(BuildingEnum.CloisterChurch, () => cloisterChurch(params[0]))
      .with(BuildingEnum.CloisterCourtyard, () => cloisterCourtyard(params[0], params[1]))
      .with(BuildingEnum.CloisterGarden, () => cloisterGarden())
      .with(BuildingEnum.CloisterLibrary, () => cloisterLibrary(params[0], params[1]))
      .with(
        BuildingEnum.CloisterOfficeR,
        BuildingEnum.CloisterOfficeG,
        BuildingEnum.CloisterOfficeB,
        BuildingEnum.CloisterOfficeW,
        () => cloisterOffice(params[0])
      )
      .with(BuildingEnum.CloisterWorkshop, () => cloisterWorkshop(params[0]))
      .with(BuildingEnum.Cottage, () => cottage())
      .with(BuildingEnum.Dormitory, () => dormitory(params[0]))
      .with(BuildingEnum.Estate, () => estate(params[0]))
      .with(BuildingEnum.FarmYardR, BuildingEnum.FarmYardG, BuildingEnum.FarmYardB, BuildingEnum.FarmYardW, () =>
        farmyard(params[0])
      )
      .with(BuildingEnum.FalseLighthouse, () => falseLighthouse(params[0]))
      .with(BuildingEnum.FinancedEstate, () => financedEstate(params[0]))
      .with(BuildingEnum.ForgersWorkshop, () => forgersWorkshop(params[0]))
      .with(BuildingEnum.FuelMerchant, () => fuelMerchant(params[0]))
      .with(BuildingEnum.GrainStorage, () => grainStorage(params[0]))
      .with(BuildingEnum.Granary, () => granary(params[0]))
      .with(BuildingEnum.GrapevineA, BuildingEnum.GrapevineA, () => grapevine(params[0]))
      .with(BuildingEnum.GrapevineB, BuildingEnum.GrapevineB, () => grapevine(params[0]))
      .with(BuildingEnum.HarborPromenade, harborPromenade)
      .with(BuildingEnum.Hospice, hospice)
      .with(BuildingEnum.Houseboat, () => houseboat())
      .with(BuildingEnum.HouseOfTheBrotherhood, () => houseOfTheBrotherhood(params[0], params[1]))
      .with(BuildingEnum.Inn, () => inn(params[0]))
      .with(BuildingEnum.Market, () => market(params[0]))
      .with(BuildingEnum.Malthouse, () => malthouse(params[0]))
      .with(BuildingEnum.Palace, () => palace(params[0]))
      .with(BuildingEnum.PeatCoalKiln, BuildingEnum.PeatCoalKiln, () => peatCoalKiln(params[0]))
      .with(BuildingEnum.PilgrimageSite, () => pilgrimageSite(params[0], params[1]))
      .with(BuildingEnum.PrintingOffice, () => printingOffice(...params))
      .with(BuildingEnum.Priory, priory)
      .with(BuildingEnum.QuarryA, BuildingEnum.QuarryB, () => quarry(params[0]))
      .with(BuildingEnum.Scriptorium, () => scriptorium(params[0]))
      .with(BuildingEnum.Sacristy, () => sacristy(params[0]))
      .with(BuildingEnum.SacredSite, () => sacredSite(params[0]))
      .with(BuildingEnum.ShippingCompany, () => shippingCompany(params[0], params[1]))
      .with(BuildingEnum.Shipyard, () => shipyard(params[0]))
      .with(BuildingEnum.Slaughterhouse, () => slaughterhouse(params[0]))
      .with(BuildingEnum.SpinningMill, () => spinningMill())
      .with(BuildingEnum.StoneMerchant, () => stoneMerchant(params[0]))
      .with(BuildingEnum.TownEstate, () => townEstate(params[0]))
      .with(BuildingEnum.WhiskeyDistillery, () => whiskeyDistillery(params[0]))
      .with(BuildingEnum.Windmill, () => windmill(params[0]))
      .with(BuildingEnum.Winery, () => winery(params[0], params[1]))
      .otherwise(() => () => {
        throw new Error(`Invalid params [${params}] for building ${building}`)
      })
  )
