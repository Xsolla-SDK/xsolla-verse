import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import useScrollToTopOnPageLoad from '../hooks/useScrollToTopOnPageLoad';
import xsollaLogo from '../assets/img/xsolla-logo.svg';
import universeBg from '../assets/img/xsolla-universe-landing.webp';
import { fetchLandingBackdropUrl } from '../utils/imageApi';
import { clearDemoPersona, setDemoPersona } from '../utils/demoWallet';
import {
  GuestIcon,
  OperatorIcon,
  PlayerIcon,
  StudioIcon,
} from '../components/verse/RoleIcons';
import locaContext from '../context/localization/locaContext';
import ChakraRegular from '../assets/fonts/ChakraPetch-Regular.ttf';
import ChakraSemiBold from '../assets/fonts/ChakraPetch-SemiBold.ttf';
import ChakraBold from '../assets/fonts/ChakraPetch-Bold.ttf';

const LOAD_DURATION_MS = 2800;

const FontFaces = createGlobalStyle`
  @font-face {
    font-family: 'Chakra Petch';
    src: url(${ChakraRegular}) format('truetype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Chakra Petch';
    src: url(${ChakraSemiBold}) format('truetype');
    font-weight: 600;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Chakra Petch';
    src: url(${ChakraBold}) format('truetype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
`;

const Landing = () => {
  useScrollToTopOnPageLoad();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useContext(locaContext);
  const [entering, setEntering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backdropSrc, setBackdropSrc] = useState(universeBg);
  const [loginError, setLoginError] = useState('');
  const [choosing, setChoosing] = useState(false);
  const rafRef = useRef(null);
  const enterQueryRef = useRef(location.search || '');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('walletAddress')) {
      navigate(`/enter${location.search}`, { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = await fetchLandingBackdropUrl();
        if (!cancelled && url) setBackdropSrc(url);
      } catch (err) {
        // Keep bundled fallback if image service is unavailable
        console.warn('Landing backdrop from image service failed', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!entering) return undefined;

    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / LOAD_DURATION_MS);
      // Ease-out curve so the bar feels like the classic loader
      const eased = 1 - Math.pow(1 - t, 2.4);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        navigate(`/enter${enterQueryRef.current || location.search}`, { replace: true });
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [entering, navigate, location.search]);

  useEffect(() => {
    if (!choosing) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setChoosing(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choosing]);

  const startEnter = (query) => {
    if (entering) return;
    setChoosing(false);
    enterQueryRef.current = query || '';
    setEntering(true);
  };

  const onPickDesk = (id) => {
    if (entering) return;
    setLoginError('');
    if (id === 'guest') {
      clearDemoPersona();
      startEnter('');
      return;
    }
    const persona = setDemoPersona(id);
    if (!persona) {
      setLoginError(t('landing.walletFail'));
      return;
    }
    startEnter(
      `?walletAddress=${encodeURIComponent(persona.address)}&username=${encodeURIComponent(
        persona.username,
      )}`,
    );
  };

  const desks = [
    {
      id: 'operator',
      label: t('role.operator'),
      blurb: t('landing.deskOperator'),
      Icon: OperatorIcon,
      tone: 'gold',
    },
    {
      id: 'studio',
      label: t('role.studio'),
      blurb: t('landing.deskStudio'),
      Icon: StudioIcon,
      tone: 'pink',
    },
    {
      id: 'player',
      label: t('role.player'),
      blurb: t('landing.deskPlayer'),
      Icon: PlayerIcon,
      tone: 'cyan',
    },
    {
      id: 'guest',
      label: t('role.guest'),
      blurb: t('landing.deskGuest'),
      Icon: GuestIcon,
      tone: 'lilac',
    },
  ];

  return (
    <Page>
      <FontFaces />
      <UniverseBackdrop aria-hidden="true">
        <UniverseImage $src={backdropSrc} />
        <OrbitRing />
      </UniverseBackdrop>
      <FrostedOverlay aria-hidden="true" />
      <StarField aria-hidden="true" />

      {!entering ? (
        <>
          <TopBar>
            <img src={xsollaLogo} alt="Xsolla" />
          </TopBar>

          <Content>
            <ProductName>
              <TitleMain>Xsolla</TitleMain>
              <TitleAccent>Verse</TitleAccent>
            </ProductName>
            <Headline>{t('landing.headline')}</Headline>
            <CtaRow>
              <PrimaryCta
                type="button"
                onClick={() => setChoosing(true)}
                disabled={entering}
              >
                <CtaGlow aria-hidden="true" />
                <span>{t('landing.enter')}</span>
              </PrimaryCta>
            </CtaRow>
            {loginError ? <LoginError>{loginError}</LoginError> : null}
            <Hint>{t('landing.hint')}</Hint>
          </Content>

          <Footer>
            <span>Powered by</span>
            <img src={xsollaLogo} alt="Xsolla" />
          </Footer>

          {choosing ? (
            <Chooser role="dialog" aria-modal="true" aria-label={t('landing.choose')}>
              <ChooserScrim type="button" aria-label="Close" onClick={() => setChoosing(false)} />
              <ChooserPanel>
                <ChooserTitle>{t('landing.choose')}</ChooserTitle>
                <DeskGrid>
                  {desks.map((desk) => (
                    <DeskCard
                      key={desk.id}
                      type="button"
                      $tone={desk.tone}
                      onClick={() => onPickDesk(desk.id)}
                    >
                      <DeskIconWrap $tone={desk.tone}>
                        <desk.Icon />
                      </DeskIconWrap>
                      <DeskName>{desk.label}</DeskName>
                      <DeskBlurb>{desk.blurb}</DeskBlurb>
                    </DeskCard>
                  ))}
                </DeskGrid>
              </ChooserPanel>
            </Chooser>
          ) : null}
        </>
      ) : (
        <LoaderPanel>
          <LoaderTitle>Loading experience…</LoaderTitle>
          <ProgressTrack
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <ProgressFill style={{ width: `${progress}%` }} />
            <ProgressShine aria-hidden="true" />
          </ProgressTrack>
          <ProgressLabel>{progress}%</ProgressLabel>
        </LoaderPanel>
      )}
    </Page>
  );
};

const kenBurns = keyframes`
  0% { transform: scale(1.08) translate3d(0, 0, 0); }
  50% { transform: scale(1.16) translate3d(-2.2%, -1.2%, 0); }
  100% { transform: scale(1.08) translate3d(0, 0, 0); }
`;

const orbitSpin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
`;

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 24px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const popIn = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 18px, 0) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
`;

const iconBob = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-5px) scale(1.06); }
`;

const ctaPulse = keyframes`
  0%, 100% {
    box-shadow:
      0 0 12px rgba(255, 110, 199, 0.25),
      0 0 28px rgba(128, 234, 255, 0.2),
      inset 0 0 14px rgba(255, 110, 199, 0.1);
    border-color: rgba(128, 234, 255, 0.55);
  }
  50% {
    box-shadow:
      0 0 22px rgba(255, 110, 199, 0.55),
      0 0 48px rgba(128, 234, 255, 0.45),
      inset 0 0 22px rgba(128, 234, 255, 0.18);
    border-color: rgba(255, 110, 199, 0.95);
  }
`;

const borderSweep = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.85; }
`;

const Page = styled.main`
  --ink: #f4f0ff;
  --muted: rgba(220, 210, 245, 0.82);
  --accent: #80eaff;
  --accent-pink: #ff6ec7;
  --accent-deep: #1a0a2e;

  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  color: var(--ink);
  font-family: 'Chakra Petch', 'Segoe UI', sans-serif;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #000;
`;

const UniverseBackdrop = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: #05010f;
`;

const UniverseImage = styled.div`
  position: absolute;
  inset: -8%;
  background:
    url(${(p) => p.$src || universeBg}) center 48% / cover no-repeat,
    #05010f;
  animation: ${kenBurns} 32s ease-in-out infinite;
  will-change: transform;
  transition: opacity 0.45s ease;
`;

const OrbitRing = styled.div`
  position: absolute;
  top: 46%;
  left: 52%;
  width: min(58vw, 620px);
  height: min(58vw, 620px);
  border-radius: 50%;
  border: 1px solid rgba(128, 234, 255, 0.18);
  box-shadow:
    0 0 40px rgba(255, 80, 180, 0.12),
    inset 0 0 40px rgba(128, 234, 255, 0.08);
  animation: ${orbitSpin} 48s linear infinite;
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    background: radial-gradient(circle, #80eaff 0%, transparent 70%);
  }

  &::before {
    width: 10px;
    height: 10px;
    transform: translate(-50%, -50%) translateY(-48%);
    opacity: 0.85;
  }

  &::after {
    width: 7px;
    height: 7px;
    transform: translate(-50%, -50%) translateY(48%);
    opacity: 0.55;
    background: radial-gradient(circle, #ff6ec7 0%, transparent 70%);
  }
`;

const FrostedOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(
      180deg,
      rgba(4, 1, 14, 0.72) 0%,
      rgba(4, 1, 14, 0.28) 42%,
      rgba(4, 1, 14, 0.86) 100%
    ),
    radial-gradient(
      ellipse 70% 55% at 50% 40%,
      rgba(120, 40, 160, 0.22) 0%,
      transparent 62%
    );
  pointer-events: none;
`;

const StarField = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image:
    radial-gradient(1.5px 1.5px at 12% 18%, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(1px 1px at 28% 62%, rgba(128, 234, 255, 0.8), transparent),
    radial-gradient(1.5px 1.5px at 64% 24%, rgba(255, 255, 255, 0.55), transparent),
    radial-gradient(1px 1px at 78% 72%, rgba(255, 110, 199, 0.7), transparent),
    radial-gradient(1.5px 1.5px at 88% 36%, rgba(255, 255, 255, 0.65), transparent),
    radial-gradient(1px 1px at 42% 84%, rgba(255, 255, 255, 0.5), transparent);
  animation: ${twinkle} 5.5s ease-in-out infinite;
`;

const TopBar = styled.header`
  position: relative;
  z-index: 2;
  padding: 1.5rem clamp(1.25rem, 4vw, 2.5rem) 0;
  animation: ${fadeUp} 0.7s ease-out both;

  img {
    width: min(168px, 46vw);
    height: auto;
    display: block;
  }
`;

const Content = styled.section`
  position: relative;
  z-index: 2;
  width: min(680px, calc(100% - 2.5rem));
  margin: 0 auto;
  align-self: center;
  text-align: center;
  padding: 2rem 0 3rem;
  animation: ${fadeUp} 0.85s 0.05s ease-out both;
`;

const titleFlicker = keyframes`
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    opacity: 1;
    filter: drop-shadow(0 0 12px rgba(128, 234, 255, 0.55))
      drop-shadow(0 0 28px rgba(255, 110, 199, 0.35));
  }
  20%, 24%, 55% {
    opacity: 0.82;
    filter: drop-shadow(0 0 6px rgba(255, 110, 199, 0.4));
  }
`;

const ProductName = styled.h1`
  position: relative;
  margin: 0 0 1.15rem;
  font-size: clamp(2.6rem, 8vw, 4.75rem);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  line-height: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.06em;
  animation: ${titleFlicker} 4.5s ease-in-out infinite;
`;

const TitleMain = styled.span`
  background: linear-gradient(
    180deg,
    #ffffff 8%,
    #80eaff 42%,
    #c4b5ff 78%,
    #ff6ec7 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-stroke: 1px rgba(128, 234, 255, 0.35);
  text-shadow: none;
  filter: drop-shadow(0 0 18px rgba(128, 234, 255, 0.35));
`;

const TitleAccent = styled.span`
  background: linear-gradient(
    180deg,
    #ffe6ff 0%,
    #ff6ec7 38%,
    #a855f7 72%,
    #80eaff 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 110, 199, 0.45);
  position: relative;

  &::after {
    content: 'VERSE';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(128, 234, 255, 0.55),
      transparent
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    opacity: 0.55;
    mix-blend-mode: screen;
    transform: translate(2px, -1px);
    pointer-events: none;
  }
`;

const Headline = styled.p`
  margin: 0 0 2.15rem;
  font-size: clamp(1.15rem, 2.5vw, 1.55rem);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e8ddff;
  text-shadow:
    0 0 18px rgba(255, 110, 199, 0.35),
    0 0 28px rgba(128, 234, 255, 0.2);
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
`;

const PrimaryCta = styled.button`
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 230px;
  padding: 1rem 1.85rem;
  border: 1px solid rgba(128, 234, 255, 0.7);
  background:
    linear-gradient(
      135deg,
      rgba(255, 110, 199, 0.55) 0%,
      rgba(88, 40, 160, 0.85) 48%,
      rgba(20, 70, 140, 0.9) 100%
    );
  color: #f8f4ff;
  font-family: inherit;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  backdrop-filter: blur(8px);
  text-shadow: 0 0 12px rgba(128, 234, 255, 0.35);
  animation:
    ${fadeUp} 0.95s 0.12s ease-out both,
    ${ctaPulse} 2.6s ease-in-out 0.9s infinite;
  transition: filter 0.25s ease, border-color 0.25s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 1px;
    background: linear-gradient(
      90deg,
      rgba(128, 234, 255, 0.15),
      rgba(255, 110, 199, 0.95),
      rgba(128, 234, 255, 0.95),
      rgba(255, 110, 199, 0.15)
    );
    background-size: 200% 100%;
    animation: ${borderSweep} 3.2s linear infinite;
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    pointer-events: none;
  }

  span {
    position: relative;
    z-index: 1;
  }

  &:hover,
  &:focus {
    filter: brightness(1.1) saturate(1.06);
    border-color: #80eaff;
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
    animation: none;
  }
`;

const Chooser = styled.div`
  position: fixed;
  inset: 0;
  z-index: 8;
  display: grid;
  place-items: center;
  padding: 1.25rem;
`;

const ChooserScrim = styled.button`
  appearance: none;
  border: 0;
  padding: 0;
  position: absolute;
  inset: 0;
  background: rgba(4, 1, 14, 0.72);
  backdrop-filter: blur(10px);
  cursor: pointer;
`;

const ChooserPanel = styled.div`
  position: relative;
  z-index: 1;
  width: min(720px, 100%);
  padding: 1.35rem 1.2rem 1.45rem;
  border: 1px solid rgba(128, 234, 255, 0.35);
  background:
    linear-gradient(
      180deg,
      rgba(28, 10, 52, 0.92) 0%,
      rgba(8, 4, 24, 0.94) 100%
    );
  box-shadow:
    0 0 40px rgba(255, 110, 199, 0.18),
    0 0 80px rgba(128, 234, 255, 0.12);
  animation: ${popIn} 0.32s ease-out both;
`;

const ChooserTitle = styled.h2`
  margin: 0 0 1.1rem;
  text-align: center;
  font-size: clamp(1.05rem, 2.4vw, 1.35rem);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #f8f4ff;
`;

const DeskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const TONE = {
  gold: {
    border: 'rgba(255, 226, 122, 0.55)',
    glow: 'rgba(255, 226, 122, 0.28)',
    fill: 'rgba(255, 226, 122, 0.1)',
  },
  pink: {
    border: 'rgba(255, 110, 199, 0.6)',
    glow: 'rgba(255, 110, 199, 0.32)',
    fill: 'rgba(255, 110, 199, 0.1)',
  },
  cyan: {
    border: 'rgba(128, 234, 255, 0.6)',
    glow: 'rgba(128, 234, 255, 0.3)',
    fill: 'rgba(128, 234, 255, 0.1)',
  },
  lilac: {
    border: 'rgba(232, 221, 255, 0.5)',
    glow: 'rgba(232, 221, 255, 0.22)',
    fill: 'rgba(232, 221, 255, 0.08)',
  },
};

const DeskCard = styled.button`
  appearance: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  padding: 1.15rem 0.85rem 1rem;
  border: 1px solid ${(p) => TONE[p.$tone].border};
  background: ${(p) => TONE[p.$tone].fill};
  color: inherit;
  font-family: inherit;
  cursor: pointer;
  text-align: center;
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;

  &:hover,
  &:focus {
    transform: translateY(-4px) scale(1.03);
    filter: brightness(1.08);
    box-shadow: 0 0 28px ${(p) => TONE[p.$tone].glow};
    outline: none;
  }
`;

const DeskIconWrap = styled.span`
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    ${(p) => TONE[p.$tone].glow} 0%,
    transparent 70%
  );
  animation: ${iconBob} 2.4s ease-in-out infinite;
  animation-delay: ${(p) =>
    ({ gold: '0s', pink: '0.15s', cyan: '0.3s', lilac: '0.45s' }[p.$tone])};
`;

const DeskName = styled.span`
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const DeskBlurb = styled.span`
  font-size: 0.78rem;
  line-height: 1.35;
  letter-spacing: 0.02em;
  color: rgba(220, 210, 245, 0.72);
`;

const LoginError = styled.p`
  margin: 0.85rem 0 0;
  color: #ff9cc9;
  font-size: 0.9rem;
`;

const Hint = styled.p`
  margin: 1rem auto 0;
  max-width: 28rem;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  color: rgba(220, 210, 245, 0.55);
`;

const CtaGlow = styled.span`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 15%,
    rgba(255, 110, 199, 0.35) 42%,
    rgba(128, 234, 255, 0.4) 58%,
    transparent 85%
  );
  animation: ${shimmer} 2.8s ease-in-out infinite;
  pointer-events: none;
`;

const Footer = styled.footer`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  padding: 0 1.25rem 1.5rem;
  opacity: 0.85;
  animation: ${fadeUp} 1s 0.2s ease-out both;

  img {
    width: 96px;
    height: auto;
    display: block;
  }

  span {
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(230, 245, 242, 0.78);
  }
`;

const LoaderPanel = styled.div`
  position: relative;
  z-index: 2;
  grid-row: 1 / -1;
  align-self: center;
  justify-self: center;
  width: min(420px, calc(100% - 2.5rem));
  text-align: center;
  animation: ${fadeUp} 0.45s ease-out both;
`;

const LoaderTitle = styled.p`
  margin: 0 0 1.25rem;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: #fff;
  text-shadow: 0 0 12px rgba(0, 255, 255, 0.35);
`;

const ProgressTrack = styled.div`
  position: relative;
  width: 100%;
  height: 12px;
  overflow: hidden;
  border: 1px solid rgba(128, 234, 255, 0.45);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 18px rgba(0, 255, 255, 0.18);
`;

const ProgressFill = styled.div`
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #0b6e6e 0%, #80eaff 55%, #e8ffff 100%);
  box-shadow: 0 0 16px rgba(128, 234, 255, 0.75);
  transition: width 0.05s linear;
`;

const ProgressShine = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.28),
    transparent
  );
  animation: ${shimmer} 1.6s linear infinite;
  pointer-events: none;
`;

const ProgressLabel = styled.p`
  margin: 0.85rem 0 0;
  font-size: 0.95rem;
  letter-spacing: 0.12em;
  color: rgba(128, 234, 255, 0.95);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.35);
`;

export default Landing;
