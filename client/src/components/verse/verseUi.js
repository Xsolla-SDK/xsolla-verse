import styled, { keyframes } from 'styled-components'

const fade = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

export const VerseSection = styled.section`
  animation: ${fade} 0.35s ease;
`

export const Lead = styled.p`
  margin: 0 0 1.1rem;
  max-width: 42rem;
  color: var(--muted);
  line-height: 1.5;
`

export const Title = styled.h2`
  margin: 0 0 0.45rem;
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const SubTitle = styled.h3`
  margin: 1.25rem 0 0.75rem;
  font-size: 0.95rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.85rem;
`

export const Cover = styled.div`
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #12081f;
  border: 1px solid rgba(128, 234, 255, 0.18);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

export const Card = styled.article`
  border: 1px solid rgba(128, 234, 255, 0.22);
  background: rgba(8, 4, 24, 0.55);
  overflow: hidden;
`

export const CardBtn = styled.button`
  appearance: none;
  width: 100%;
  text-align: left;
  border: 1px solid rgba(128, 234, 255, 0.22);
  background: rgba(8, 4, 24, 0.55);
  color: inherit;
  font: inherit;
  padding: 0;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    border-color: rgba(255, 110, 199, 0.55);
  }
`

export const CardBody = styled.div`
  padding: 0.75rem 0.85rem 0.9rem;
`

export const CardTitle = styled.div`
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.92rem;
`

export const Meta = styled.p`
  margin: 0.3rem 0 0;
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.4;
`

export const Stamp = styled.span`
  display: inline-block;
  margin-top: 0.4rem;
  padding: 0.2rem 0.45rem;
  border: 1px solid rgba(128, 234, 255, 0.4);
  color: var(--cyan);
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.7rem;
`

export const Primary = styled.button`
  appearance: none;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border: 1px solid rgba(128, 234, 255, 0.55);
  background: linear-gradient(
    135deg,
    rgba(255, 110, 199, 0.45),
    rgba(88, 40, 160, 0.85),
    rgba(20, 70, 140, 0.9)
  );
  color: #fff;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const Ghost = styled.button`
  appearance: none;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border: 1px solid rgba(128, 234, 255, 0.35);
  background: rgba(8, 4, 24, 0.45);
  color: inherit;
`

export const Banner = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 0.85rem;
  align-items: center;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(255, 110, 199, 0.35);
  background: rgba(255, 110, 199, 0.08);
  overflow: hidden;

  img {
    width: 140px;
    height: 88px;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    img {
      width: 100%;
      height: 140px;
    }
  }
`

export const Input = styled.input`
  font: inherit;
  color: #fff;
  background: rgba(8, 4, 24, 0.6);
  border: 1px solid rgba(128, 234, 255, 0.28);
  padding: 0.5rem 0.7rem;
  width: min(100%, 280px);
`

export const TextArea = styled.textarea`
  font: inherit;
  color: #fff;
  background: rgba(8, 4, 24, 0.6);
  border: 1px solid rgba(128, 234, 255, 0.28);
  padding: 0.5rem 0.7rem;
  width: 100%;
  min-height: 88px;
  resize: vertical;
`

export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.45rem;
  border: 1px solid rgba(128, 234, 255, 0.25);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
`
