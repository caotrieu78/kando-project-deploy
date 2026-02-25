import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import Top3Teams from "./Top3Teams";

const HomePage: React.FC = () => {
    const { isAuthenticated } = useAppSelector((state) => state.account);

    return (
        <>
            <div className="hero-car-wrapper">
                <img src="/xe.png" alt="racing car" className="hero-car" />
                <span className="light-beam beam-1"></span>
                <span className="light-beam beam-2"></span>
                <span className="light-beam beam-3"></span>
                <span className="light-beam beam-4"></span>
            </div>
            {isAuthenticated && <Top3Teams />}

            <section id="home" className="hero">
                <div className="hero-group">
                    <div className="hero-content">
                        <h1 className="glitch" data-text="KANDO GRAND PRIX 2026">
                            KANDO GRAND PRIX 2026
                        </h1>
                    </div>

                    {isAuthenticated && (
                        <Access
                            permission={ALL_PERMISSIONS.METRIC_SUMMARY.GET_PERIOD_ME}
                            hideChildren
                        >
                            <Link to="/score" className="scroll-group">
                                <p className="scroll-text">THAM GIA NGAY</p>
                                <div className="scroll-btn">
                                    <div className="scroll-btn-inner">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        </Access>
                    )}
                </div>
            </section>
        </>
    );
};

export default HomePage;
