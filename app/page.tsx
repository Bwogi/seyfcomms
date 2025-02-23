import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Features from './components/Features'

export default function Home() {
  return (
    <div className="p-4 bg-blue-100">
      <Navigation />
      <Hero />
      <Features />
    </div>
  )
}
