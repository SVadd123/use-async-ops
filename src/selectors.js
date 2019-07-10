import { getReducerkey, STORE_DOMAIN } from './reducer'

export const statusSelector = (name, channel) => state =>
  state[STORE_DOMAIN][getReducerkey({ name, channel })] || {}

export const loadingSelector = (name, channel) => state =>
  statusSelector(name, channel).loading || false

export const errorSelector = (name, channel) => state =>
  statusSelector(name, channel).error || null
