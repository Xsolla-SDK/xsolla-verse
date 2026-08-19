import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styled, { createGlobalStyle, keyframes } from 'styled-components'
import xsollaLogo from '../assets/img/xsolla-logo.svg'
import xsollaIcon from '../assets/img/xsolla-icon.svg'
import universeBg from '../assets/img/xsolla-universe-landing.webp'
import useScrollToTopOnPageLoad from '../hooks/useScrollToTopOnPageLoad'
import marvelSnap from '../assets/shop/marvel-weblaunch.png'
import cookingDiary from '../assets/shop/cooking-cover.jpg'
import seekersNotes from '../assets/shop/seekers-notes.jpg'
import holdem from '../assets/online/online-holdem.jpg'
import blackjack from '../assets/online/online-blackjack.jpg'
import tournament from '../assets/online/online-mtt.jpg'
import verseBanner from '../assets/shop/verse-banner.png'
import ChakraRegular from '../assets/fonts/ChakraPetch-Regular.ttf'
import ChakraSemiBold from '../assets/fonts/ChakraPetch-SemiBold.ttf'
import ChakraBold from '../assets/fonts/ChakraPetch-Bold.ttf'

const worlds = [
  { name: 'MARVEL SNAP', type: 'PARTNER WORLD', image: marvelSnap, color: '#ff6ec7' },
  { name: 'Cooking Diary', type: 'LIVE GAME', image: cookingDiary, color: '#ffe27a' },
  { name: 'Seekers Notes', type: 'STORY WORLD', image: seekersNotes, color: '#cbb8ff' },
  { name: 'Hold’em', type: 'VERSE TABLE', image: holdem, color: '#80eaff' },
  { name: 'Blackjack', type: 'VERSE TABLE', image: blackjack, color: '#65ffbd' },
  { name: 'Championships', type: 'LIVE EVENT', image: tournament, color: '#ff9868' },
]

const journey = [
  { n: '01', title: 'Enter', copy: 'One identity opens the whole XsollaVerse.' },
  { n: '02', title: 'Explore', copy: 'Move between partner worlds, tables, drops, and live events.' },
  { n: '03', title: 'Play', copy: 'Use fast real-time game loops without waiting on the chain.' },
  { n: '04', title: 'Own', copy: 'Keep items and rewards in one portable Backpack.' },
  { n: '05', title: 'Trade', copy: 'Move assets through a transparent player marketplace.' },
]

const ecosystem = [
  { icon: '◈', title: 'Game Hub', copy: 'Discovery, events, partner worlds, and social activity in one destination.' },
  { icon: '▦', title: 'Game Shop', copy: 'Title-specific packs and cosmetics powered by familiar commerce flows.' },
  { icon: '⬡', title: 'Backpack', copy: 'A single view of owned items, rewards, access passes, and identity.' },
  { icon: '⇄', title: 'Market', copy: 'Player-to-player exchange with studio royalties built into each sale.' },
  { icon: '✦', title: 'Live Games', copy: 'Poker, blackjack, tournaments, and future skill-based experiences.' },
  { icon: '◎', title: 'Studio Layer', copy: 'Tools for partners to list games, launch drops, and grow their communities.' },
]

function ProductStory() {
  useScrollToTopOnPageLoad()
  const pageRef = useRef(null)

  useEffect(() => {
    const page = pageRef.current
    if (!page || typeof IntersectionObserver === 'undefined') return undefined

    const nodes = page.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <Page ref={pageRef}>
      <Fonts />
      <Noise aria-hidden="true" />
      <Header>
        <Brand to="/">
          <img src={xsollaLogo} alt="Xsolla" />
          <BrandName>VERSE</BrandName>
        </Brand>
        <HeaderNav>
          <HeaderLink href="#ecosystem">Ecosystem</HeaderLink>
          <HeaderLink href="#worlds">Worlds</HeaderLink>
          <EnterLink to="/">Enter Hub <span>↗</span></EnterLink>
        </HeaderNav>
      </Header>

      <Hero>
        <HeroBackdrop $image={universeBg} aria-hidden="true" />
        <HeroGrid aria-hidden="true" />
        <HeroGlow aria-hidden="true" />
        <HeroCopy data-reveal>
          <Eyebrow><i /> THE CONNECTED GAME UNIVERSE</Eyebrow>
          <HeroTitle>
            Every game is a world.
            <strong>The Hub connects them.</strong>
          </HeroTitle>
          <HeroText>
            XsollaVerse brings discovery, play, commerce, ownership, and community
            into one living game ecosystem.
          </HeroText>
          <HeroActions>
            <PrimaryLink to="/">ENTER XSOLLAVERSE <span>→</span></PrimaryLink>
            <ScrollLink href="#ecosystem">EXPLORE THE SYSTEM <span>↓</span></ScrollLink>
          </HeroActions>
        </HeroCopy>

        <OrbitStage aria-hidden="true">
          <OrbitRing $size="430px" $speed="26s" />
          <OrbitRing $size="300px" $speed="18s" $reverse />
          <Core>
            <CorePulse />
            <img src={xsollaIcon} alt="" />
            <b>THE HUB</b>
            <small>ONE WORLD · MANY GAMES</small>
          </Core>
          <OrbitCard $x="-190px" $y="-130px" $delay="0s">
            <img src={marvelSnap} alt="" /><span>DISCOVER</span>
          </OrbitCard>
          <OrbitCard $x="180px" $y="-105px" $delay="-1.8s">
            <img src={cookingDiary} alt="" /><span>EXPLORE</span>
          </OrbitCard>
          <OrbitCard $x="-170px" $y="145px" $delay="-3.6s">
            <img src={holdem} alt="" /><span>PLAY</span>
          </OrbitCard>
          <OrbitCard $x="170px" $y="140px" $delay="-5.4s">
            <img src={verseBanner} alt="" /><span>OWN</span>
          </OrbitCard>
        </OrbitStage>

        <HeroRail>
          <span>DISCOVER</span><i />
          <span>PLAY</span><i />
          <span>OWN</span><i />
          <span>TRADE</span><i />
          <span>CONNECT</span>
        </HeroRail>
      </Hero>

      <Section id="ecosystem">
        <SectionHead data-reveal>
          <SectionIndex>01 / THE SYSTEM</SectionIndex>
          <SectionTitle>One hub. A complete game loop.</SectionTitle>
          <SectionText>
            The Hub is not another storefront. It is the connective layer between
            players, games, studios, and Xsolla’s commerce infrastructure.
          </SectionText>
        </SectionHead>

        <EcosystemGrid>
          <SystemCore data-reveal>
            <SystemHalo />
            <img src={xsollaIcon} alt="" />
            <span>XSOLLA</span>
            <strong>VERSE HUB</strong>
            <small>IDENTITY · DISCOVERY · COMMERCE</small>
          </SystemCore>
          {ecosystem.map((item, index) => (
            <EcosystemCard
              key={item.title}
              data-reveal
              style={{ '--delay': `${index * 80}ms` }}
            >
              <CardNumber>0{index + 1}</CardNumber>
              <CardIcon>{item.icon}</CardIcon>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <CardLine />
            </EcosystemCard>
          ))}
        </EcosystemGrid>
      </Section>

      <DarkSection>
        <SectionHead data-reveal>
          <SectionIndex>02 / THE PLAYER LOOP</SectionIndex>
          <SectionTitle>From first click to lasting ownership.</SectionTitle>
        </SectionHead>
        <Journey>
          <JourneyBeam aria-hidden="true" />
          {journey.map((step, index) => (
            <JourneyStep
              key={step.n}
              data-reveal
              style={{ '--delay': `${index * 100}ms` }}
            >
              <StepNode>{step.n}</StepNode>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </JourneyStep>
          ))}
        </Journey>
      </DarkSection>

      <WorldSection id="worlds">
        <SectionHead data-reveal>
          <SectionIndex>03 / CONNECTED WORLDS</SectionIndex>
          <SectionTitle>Different games. One shared destination.</SectionTitle>
          <SectionText>
            Partner titles keep their own identity. XsollaVerse gives them a common
            discovery surface, player graph, live-event layer, and economy.
          </SectionText>
        </SectionHead>
        <WorldRail>
          <WorldTrack>
            {[...worlds, ...worlds].map((world, index) => (
              <WorldCard key={`${world.name}-${index}`} $color={world.color}>
                <img src={world.image} alt="" />
                <WorldShade />
                <WorldType>{world.type}</WorldType>
                <WorldName>{world.name}</WorldName>
                <WorldArrow>↗</WorldArrow>
              </WorldCard>
            ))}
          </WorldTrack>
        </WorldRail>
      </WorldSection>

      <EconomySection>
        <EconomyVisual data-reveal>
          <EconomyOrbit $size="520px" />
          <EconomyOrbit $size="370px" $reverse />
          <EconomyCore>
            <img src={xsollaIcon} alt="" />
            <strong>COMMERCE CORE</strong>
            <span>FIAT + ON-CHAIN</span>
          </EconomyCore>
          <EconomyNode $x="50%" $y="2%"><b>PAYMENTS</b><small>Familiar checkout</small></EconomyNode>
          <EconomyNode $x="92%" $y="40%"><b>XSOLLA</b><small>Utility layer</small></EconomyNode>
          <EconomyNode $x="75%" $y="84%"><b>STAKING</b><small>Access + loyalty</small></EconomyNode>
          <EconomyNode $x="25%" $y="84%"><b>ROYALTIES</b><small>Studio revenue</small></EconomyNode>
          <EconomyNode $x="8%" $y="40%"><b>ASSETS</b><small>Portable ownership</small></EconomyNode>
        </EconomyVisual>
        <EconomyCopy data-reveal>
          <SectionIndex>04 / THE ECONOMY</SectionIndex>
          <SectionTitle>Commerce underneath. Game magic on top.</SectionTitle>
          <SectionText>
            Players should not need to understand infrastructure to enjoy the
            ecosystem. The Hub combines familiar payments with an on-chain ownership
            layer, while games stay fast and fun.
          </SectionText>
          <Principles>
            <li><b>01</b><span><strong>Pay naturally</strong>Cards, local methods, stablecoins, or XSOLLA.</span></li>
            <li><b>02</b><span><strong>Play instantly</strong>Real-time sessions stay off-chain where speed matters.</span></li>
            <li><b>03</b><span><strong>Settle transparently</strong>Ownership, staking, and royalties become verifiable.</span></li>
          </Principles>
        </EconomyCopy>
      </EconomySection>

      <FinalCta>
        <FinalBackdrop $image={universeBg} />
        <FinalContent data-reveal>
          <img src={xsollaLogo} alt="Xsolla" />
          <small>THE UNIVERSE IS OPEN</small>
          <h2>Enter the Hub.<br />Find your next world.</h2>
          <PrimaryLink to="/">ENTER XSOLLAVERSE <span>→</span></PrimaryLink>
        </FinalContent>
      </FinalCta>
    </Page>
  )
}

const Fonts = createGlobalStyle`
  @font-face { font-family: 'Chakra Petch'; src: url(${ChakraRegular}); font-weight: 400; }
  @font-face { font-family: 'Chakra Petch'; src: url(${ChakraSemiBold}); font-weight: 600; }
  @font-face { font-family: 'Chakra Petch'; src: url(${ChakraBold}); font-weight: 700; }
  html { scroll-behavior: smooth; }
`

const drift = keyframes`0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-13px,0)}`
const spin = keyframes`to{transform:rotate(360deg)}`
const spinReverse = keyframes`to{transform:rotate(-360deg)}`
const pulse = keyframes`0%,100%{opacity:.35;transform:scale(.86)}50%{opacity:.8;transform:scale(1.12)}`
const scan = keyframes`from{transform:translateY(-100%)}to{transform:translateY(100vh)}`
const marquee = keyframes`to{transform:translateX(-50%)}`
const beam = keyframes`from{background-position:200% 0}to{background-position:-200% 0}`

const Page = styled.main`
  min-height: 100vh;
  overflow: hidden;
  background: #05010f;
  color: #f8f4ff;
  font-family: 'Chakra Petch', sans-serif;
  [data-reveal] { opacity: 0; transform: translateY(36px); transition: opacity .8s ease var(--delay, 0ms), transform .8s cubic-bezier(.2,.8,.2,1) var(--delay, 0ms); }
  [data-reveal].is-visible { opacity: 1; transform: translateY(0); }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; }
    [data-reveal] { opacity: 1; transform: none; }
  }
`

const Noise = styled.div`
  position: fixed; inset: 0; z-index: 20; pointer-events: none; opacity: .055;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
`
const Header = styled.header`
  position: absolute; z-index: 15; top: 0; left: 0; right: 0; height: 86px; padding: 0 clamp(1.2rem,4vw,4.5rem);
  display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.12);
  background: linear-gradient(180deg,rgba(5,1,15,.8),transparent);
`
const Brand = styled(Link)`display:flex;align-items:center;gap:1rem;color:#fff;text-decoration:none;img{width:118px;height:auto}`
const BrandName = styled.span`padding-left:1rem;border-left:1px solid rgba(255,255,255,.3);font-size:.75rem;letter-spacing:.32em`
const HeaderNav = styled.nav`display:flex;align-items:center;gap:1.7rem;@media(max-width:700px){a:not(:last-child){display:none}}`
const HeaderLink = styled.a`color:rgba(255,255,255,.7);font-size:.72rem;letter-spacing:.16em;text-decoration:none;&:hover{color:#80eaff}`
const EnterLink = styled(Link)`padding:.7rem 1rem;border:1px solid rgba(128,234,255,.55);color:#fff;text-decoration:none;font-size:.72rem;letter-spacing:.14em;background:rgba(128,234,255,.08);span{color:#80eaff}`

const Hero = styled.section`position:relative;min-height:100vh;display:flex;align-items:center;padding:9rem clamp(1.25rem,7vw,8rem) 6rem`
const HeroBackdrop = styled.div`
  position:absolute;inset:0;background:url(${p=>p.$image}) center/cover;filter:saturate(.85) contrast(1.1);transform:scale(1.04);
  &::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,1,15,.98) 5%,rgba(5,1,15,.72) 47%,rgba(5,1,15,.23) 100%),linear-gradient(0deg,#05010f 0%,transparent 28%)}
`
const HeroGrid = styled.div`position:absolute;inset:0;opacity:.12;background-image:linear-gradient(rgba(128,234,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(128,234,255,.2) 1px,transparent 1px);background-size:72px 72px;mask-image:linear-gradient(to bottom,transparent,black 25%,transparent 95%)`
const HeroGlow = styled.div`position:absolute;width:44vw;height:44vw;right:-4vw;top:12vh;border-radius:50%;background:radial-gradient(circle,rgba(102,48,190,.38),transparent 65%);filter:blur(10px)`
const HeroCopy = styled.div`position:relative;z-index:3;width:min(700px,55vw);@media(max-width:980px){width:100%}`
const Eyebrow = styled.div`display:flex;align-items:center;gap:.8rem;color:#80eaff;font-size:.73rem;letter-spacing:.24em;margin-bottom:1.5rem;i{width:36px;height:1px;background:#80eaff;box-shadow:0 0 12px #80eaff}`
const HeroTitle = styled.h1`margin:0;font-size:clamp(3.2rem,6.3vw,7rem);line-height:.91;letter-spacing:-.045em;font-weight:600;text-transform:uppercase;strong{display:block;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.78);text-shadow:0 0 34px rgba(128,234,255,.16)}`
const HeroText = styled.p`max-width:620px;margin:2rem 0;color:rgba(239,234,255,.72);font-size:clamp(1rem,1.35vw,1.2rem);line-height:1.7`
const HeroActions = styled.div`display:flex;gap:.9rem;flex-wrap:wrap`
const PrimaryLink = styled(Link)`display:inline-flex;align-items:center;gap:2.5rem;padding:1rem 1.3rem;color:#05010f;background:#80eaff;text-decoration:none;font-size:.75rem;font-weight:700;letter-spacing:.13em;box-shadow:0 0 30px rgba(128,234,255,.25);transition:.25s;&:hover{background:#ff6ec7;box-shadow:0 0 42px rgba(255,110,199,.4);transform:translateY(-3px)}`
const ScrollLink = styled.a`display:inline-flex;align-items:center;gap:2rem;padding:1rem 1.3rem;border:1px solid rgba(255,255,255,.25);color:#fff;text-decoration:none;font-size:.75rem;letter-spacing:.13em;background:rgba(10,4,25,.35);backdrop-filter:blur(8px);&:hover{border-color:#80eaff}`

const OrbitStage = styled.div`position:absolute;z-index:2;right:4vw;top:52%;width:520px;height:520px;transform:translateY(-50%);@media(max-width:980px){opacity:.22;right:-230px;pointer-events:none}`
const OrbitRing = styled.div`position:absolute;left:50%;top:50%;width:${p=>p.$size};height:${p=>p.$size};margin:${p=>`${parseFloat(p.$size)/-2}px`};border:1px solid rgba(128,234,255,.22);border-radius:50%;animation:${p=>p.$reverse?spinReverse:spin} ${p=>p.$speed} linear infinite;&::before{content:'';position:absolute;width:7px;height:7px;border-radius:50%;background:#ff6ec7;left:50%;top:-4px;box-shadow:0 0 18px #ff6ec7}`
const Core = styled.div`position:absolute;left:50%;top:50%;width:176px;height:176px;transform:translate(-50%,-50%);border:1px solid rgba(128,234,255,.55);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(5,1,15,.78);box-shadow:0 0 60px rgba(128,234,255,.18),inset 0 0 30px rgba(128,234,255,.08);backdrop-filter:blur(12px);img{width:48px;margin-bottom:.5rem}b{font-size:.9rem;letter-spacing:.16em}small{font-size:.46rem;letter-spacing:.15em;color:#80eaff;margin-top:.3rem}`
const CorePulse = styled.div`position:absolute;inset:-32px;border:1px solid rgba(128,234,255,.25);border-radius:50%;animation:${pulse} 3s ease-in-out infinite`
const OrbitCard = styled.div`position:absolute;left:50%;top:50%;width:116px;height:82px;transform:translate(calc(-50% + ${p=>p.$x}),calc(-50% + ${p=>p.$y}));border:1px solid rgba(255,255,255,.28);background:#090319;overflow:hidden;animation:${drift} 5s ease-in-out ${p=>p.$delay} infinite;box-shadow:0 12px 35px rgba(0,0,0,.45);img{width:100%;height:100%;object-fit:cover;opacity:.78}span{position:absolute;left:.5rem;bottom:.4rem;font-size:.5rem;letter-spacing:.16em;text-shadow:0 2px 8px #000}`
const HeroRail = styled.div`position:absolute;z-index:3;left:clamp(1.25rem,7vw,8rem);right:clamp(1.25rem,7vw,8rem);bottom:2rem;display:flex;align-items:center;justify-content:space-between;color:rgba(255,255,255,.43);font-size:.58rem;letter-spacing:.2em;i{height:1px;flex:1;margin:0 1rem;background:linear-gradient(90deg,transparent,rgba(128,234,255,.5),transparent)}`

const Section = styled.section`position:relative;padding:clamp(5rem,9vw,9rem) clamp(1.25rem,7vw,8rem);background:radial-gradient(circle at 20% 15%,rgba(66,26,120,.22),transparent 35%),#080217`
const DarkSection = styled(Section)`background:#030109;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)`
const SectionHead = styled.div`max-width:760px;margin-bottom:4rem`
const SectionIndex = styled.div`color:#80eaff;font-size:.68rem;letter-spacing:.24em;margin-bottom:1rem`
const SectionTitle = styled.h2`margin:0 0 1.3rem;font-size:clamp(2.4rem,5vw,5rem);line-height:.96;letter-spacing:-.04em;text-transform:uppercase`
const SectionText = styled.p`margin:0;color:rgba(236,230,255,.64);font-size:1.05rem;line-height:1.75;max-width:700px`
const EcosystemGrid = styled.div`position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;@media(max-width:900px){grid-template-columns:repeat(2,1fr)}@media(max-width:580px){grid-template-columns:1fr}`
const SystemCore = styled.div`grid-column:2;grid-row:1 / span 2;min-height:430px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;border:1px solid rgba(128,234,255,.35);background:radial-gradient(circle,rgba(128,234,255,.15),rgba(11,3,29,.78) 62%);overflow:hidden;img{width:84px;margin-bottom:1rem;filter:drop-shadow(0 0 20px rgba(128,234,255,.45))}span{font-size:.68rem;letter-spacing:.35em;color:#80eaff}strong{font-size:1.5rem;letter-spacing:.08em;margin:.45rem 0}small{font-size:.55rem;letter-spacing:.18em;color:rgba(255,255,255,.45)}@media(max-width:900px){grid-column:1/-1;grid-row:auto;min-height:320px}`
const SystemHalo = styled.div`position:absolute;width:270px;height:270px;border:1px solid rgba(128,234,255,.3);border-radius:50%;animation:${spin} 16s linear infinite;&::before,&::after{content:'';position:absolute;border-radius:50%;background:#ff6ec7;box-shadow:0 0 16px #ff6ec7;width:7px;height:7px;top:-4px;left:50%}&::after{top:auto;bottom:-4px;background:#80eaff;box-shadow:0 0 16px #80eaff}`
const EcosystemCard = styled.article`position:relative;min-height:205px;padding:1.5rem;border:1px solid rgba(255,255,255,.12);background:linear-gradient(135deg,rgba(255,255,255,.055),rgba(255,255,255,.015));overflow:hidden;transition:.3s;&:hover{transform:translateY(-8px);border-color:rgba(128,234,255,.55);box-shadow:0 18px 50px rgba(0,0,0,.35)}h3{margin:2.5rem 0 .6rem;font-size:1.2rem;text-transform:uppercase}p{margin:0;color:rgba(235,229,255,.57);font-size:.86rem;line-height:1.55}`
const CardNumber = styled.span`position:absolute;right:1rem;top:1rem;color:rgba(255,255,255,.22);font-size:.65rem`
const CardIcon = styled.span`font-size:1.6rem;color:#80eaff;text-shadow:0 0 15px rgba(128,234,255,.55)`
const CardLine = styled.div`position:absolute;height:2px;left:0;right:100%;bottom:0;background:linear-gradient(90deg,#80eaff,#ff6ec7);transition:.4s;${EcosystemCard}:hover &{right:0}`

const Journey = styled.div`position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:1.2rem;padding-top:1rem;@media(max-width:850px){grid-template-columns:1fr 1fr}@media(max-width:520px){grid-template-columns:1fr}`
const JourneyBeam = styled.div`position:absolute;left:6%;right:6%;top:43px;height:2px;background:linear-gradient(90deg,transparent,#80eaff,#ff6ec7,#80eaff,transparent);background-size:200% 100%;animation:${beam} 5s linear infinite;@media(max-width:850px){display:none}`
const JourneyStep = styled.article`position:relative;z-index:1;text-align:center;padding:0 .8rem;h3{font-size:1.12rem;text-transform:uppercase;letter-spacing:.08em}p{font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.52)}`
const StepNode = styled.div`width:66px;height:66px;margin:0 auto 1.4rem;border:1px solid rgba(128,234,255,.5);border-radius:50%;display:grid;place-items:center;background:#05010f;color:#80eaff;font-size:.7rem;box-shadow:0 0 0 8px #030109,0 0 30px rgba(128,234,255,.2)`

const WorldSection = styled(Section)`padding-left:0;padding-right:0;${SectionHead}{margin-left:clamp(1.25rem,7vw,8rem);margin-right:clamp(1.25rem,7vw,8rem)}`
const WorldRail = styled.div`overflow:hidden;mask-image:linear-gradient(90deg,transparent,black 8%,black 92%,transparent)`
const WorldTrack = styled.div`display:flex;width:max-content;gap:1rem;animation:${marquee} 38s linear infinite;&:hover{animation-play-state:paused}`
const WorldCard = styled.article`position:relative;width:min(370px,76vw);height:460px;flex:none;overflow:hidden;border:1px solid rgba(255,255,255,.13);background:#05010f;img{width:100%;height:100%;object-fit:cover;transition:transform .7s,filter .7s} &:hover img{transform:scale(1.08);filter:saturate(1.25)}&::after{content:'';position:absolute;left:0;right:0;bottom:0;height:3px;background:${p=>p.$color};box-shadow:0 0 20px ${p=>p.$color}}`
const WorldShade = styled.div`position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(5,1,15,.94))`
const WorldType = styled.span`position:absolute;left:1.3rem;top:1.3rem;padding:.45rem .65rem;background:rgba(5,1,15,.72);backdrop-filter:blur(8px);font-size:.55rem;letter-spacing:.18em;color:#80eaff`
const WorldName = styled.h3`position:absolute;left:1.3rem;right:3.5rem;bottom:1.3rem;margin:0;font-size:1.55rem;text-transform:uppercase`
const WorldArrow = styled.span`position:absolute;right:1.3rem;bottom:1.3rem;font-size:1.3rem;color:#80eaff`

const EconomySection = styled.section`display:grid;grid-template-columns:1.1fr .9fr;align-items:center;gap:clamp(3rem,7vw,8rem);padding:clamp(6rem,10vw,10rem) clamp(1.25rem,7vw,8rem);background:linear-gradient(135deg,#05010f,#10042b);@media(max-width:1000px){grid-template-columns:1fr}`
const EconomyVisual = styled.div`position:relative;min-height:600px;@media(max-width:650px){min-height:430px;transform:scale(.82);margin:-50px}`
const EconomyOrbit = styled.div`position:absolute;left:50%;top:50%;width:${p=>p.$size};height:${p=>p.$size};transform:translate(-50%,-50%);border:1px dashed rgba(128,234,255,.26);border-radius:50%;&::before{content:'';position:absolute;inset:12%;border:1px solid rgba(255,110,199,.15);border-radius:50%;animation:${p=>p.$reverse?spinReverse:spin} 20s linear infinite}`
const EconomyCore = styled.div`position:absolute;left:50%;top:50%;width:190px;height:190px;transform:translate(-50%,-50%);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(128,234,255,.18),rgba(5,1,15,.95) 68%);border:1px solid rgba(128,234,255,.48);box-shadow:0 0 70px rgba(128,234,255,.2);img{width:52px;margin-bottom:.6rem}strong{font-size:.78rem;letter-spacing:.12em}span{font-size:.52rem;color:#80eaff;letter-spacing:.18em;margin-top:.3rem}`
const EconomyNode = styled.div`position:absolute;left:${p=>p.$x};top:${p=>p.$y};transform:translate(-50%,-50%);min-width:132px;padding:.8rem;border:1px solid rgba(255,255,255,.18);background:rgba(10,3,25,.82);backdrop-filter:blur(8px);text-align:center;animation:${drift} 5s ease-in-out infinite;b{display:block;font-size:.65rem;letter-spacing:.15em;color:#fff}small{display:block;margin-top:.3rem;font-size:.52rem;color:#80eaff}`
const EconomyCopy = styled.div`max-width:620px`
const Principles = styled.ul`list-style:none;padding:0;margin:2.5rem 0 0;display:grid;gap:.8rem;li{display:flex;gap:1rem;padding:1rem 0;border-top:1px solid rgba(255,255,255,.12)}b{color:#80eaff;font-size:.66rem}span{display:flex;flex-direction:column;gap:.3rem;color:rgba(255,255,255,.55);font-size:.82rem;line-height:1.5}strong{color:#fff;font-size:.9rem;text-transform:uppercase;letter-spacing:.08em}`

const FinalCta = styled.section`position:relative;min-height:620px;display:grid;place-items:center;text-align:center;overflow:hidden`
const FinalBackdrop = styled.div`position:absolute;inset:0;background:url(${p=>p.$image}) center/cover;filter:saturate(.75);transform:scale(1.08);&::after{content:'';position:absolute;inset:0;background:radial-gradient(circle,rgba(5,1,15,.3),rgba(5,1,15,.96) 78%)}`
const FinalContent = styled.div`position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;img{width:150px;margin-bottom:2rem}small{font-size:.65rem;letter-spacing:.28em;color:#80eaff}h2{font-size:clamp(2.7rem,6vw,6rem);line-height:.95;text-transform:uppercase;margin:1.2rem 0 2rem}`

export default ProductStory
