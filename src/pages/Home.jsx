import { useMeta } from '../hooks'
import Hero from './home/Hero'
import Intro from './home/Intro'
import CoffeeSection from './home/CoffeeSection'
import ThriftSection from './home/ThriftSection'
import DropSection from './home/DropSection'
import PairsSection from './home/PairsSection'
import SpaceSection from './home/SpaceSection'
import EventsSection from './home/EventsSection'
import SocialSection from './home/SocialSection'

export default function Home() {
  useMeta({
    title: null,
    description: 'Specialty coffee and carefully chosen pieces for everyday life. Alegre × Good Habits — a coffee shop and curated thrift store in one space.',
  })

  return (
    <>
      <Hero />
      <Intro />
      <CoffeeSection />
      <ThriftSection />
      <DropSection />
      <PairsSection />
      <SpaceSection />
      <EventsSection />
      <SocialSection />
    </>
  )
}
