import React from 'react'
import styled from 'styled-components'
import StakeMedalIcon from '../icons/StakeMedalIcon'
import { STAKE_TIERS } from '../../contracts/stakeTiers'

const StakeTierCells = ({ currentId = 0, onSelect }) => (
  <Grid>
    {STAKE_TIERS.map((tier) => {
      const active = currentId === tier.id
      const reached = currentId >= tier.id
      return (
        <Cell
          key={tier.id}
          $tone={tier.tone}
          $accent={tier.accent}
          $active={active}
          type={onSelect ? 'button' : undefined}
          as={onSelect ? 'button' : 'div'}
          onClick={onSelect ? () => onSelect(tier) : undefined}
        >
          <StakeMedalIcon tone={tier.tone} size={72} />
          <Name $accent={tier.accent}>{tier.name} medal</Name>
          <Min>{tier.min} XSOLLA</Min>
          <Perks>
            {tier.perks.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </Perks>
          {onSelect ? (
            <Action $accent={tier.accent}>
              {reached ? 'Add stake' : `Stake ${tier.min}`}
            </Action>
          ) : null}
        </Cell>
      )
    })}
  </Grid>
)

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0.85rem 0 0.35rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

const Cell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.45rem;
  padding: 1.05rem 0.75rem 1.1rem;
  appearance: none;
  font: inherit;
  color: inherit;
  overflow: visible;
  cursor: ${(p) => (p.as === 'button' || p.type === 'button' ? 'pointer' : 'default')};
  border: 1px solid ${(p) => (p.$active ? p.$accent : `${p.$accent}88`)};
  background: ${(p) => {
    const a = p.$active ? 0.22 : 0.12
    if (p.$tone === 'bronze') return `rgba(196, 122, 58, ${a})`
    if (p.$tone === 'silver') return `rgba(143, 164, 184, ${a})`
    return `rgba(224, 179, 58, ${a})`
  }};
  box-shadow: ${(p) =>
    p.$active ? `0 0 0 1px ${p.$accent}, 0 10px 28px ${p.$accent}40` : 'none'};
`

const Name = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${(p) => p.$accent};
`

const Min = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
`

const Perks = styled.ul`
  margin: 0.25rem 0 0;
  padding: 0;
  list-style: none;
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.4;
  width: 100%;
`

const Action = styled.span`
  margin-top: 0.45rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${(p) => p.$accent};
`

export default StakeTierCells
