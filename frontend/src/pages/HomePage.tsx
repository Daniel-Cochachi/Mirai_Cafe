import { AboutSection } from '../components/home/AboutSection'
import { BenefitsBar } from '../components/home/BenefitsBar'
import { CategorySection } from '../components/home/CategorySection'
import { HeroBanner } from '../components/home/HeroBanner'
import { LocationSection } from '../components/home/LocationSection'
import { PopularProducts } from '../components/home/PopularProducts'
import { PromoSection } from '../components/home/PromoSection'
import { Footer } from '../components/layout/footer'
import { Navbar } from '../components/layout/Navbar'

export function HomePage() {
    return (
        <>
            <Navbar />

            <main className="bg-white">
                <HeroBanner />
                <BenefitsBar />
                <CategorySection />
                <PopularProducts />
                <AboutSection />
                <PromoSection />
                <LocationSection />
            </main>
            <Footer />
        </>
    )
}