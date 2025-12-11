
import Image from "next/image";
import BgGradient from "@/src/_assets/images/gradient-bg.png";
import leftImage from "@/src/_assets/images/Ellipse 40 (1).png";
import rightImage from "@/src/_assets/images/Ellipse 40.png";

export default function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center relative justify-center p-4 bg-gradient-custom">
      
      <div
        className="backend-gradient-wrapper"
        style={{
          backgroundImage: `url(${BgGradient.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="left-bottom-gradient">
          <Image
            src={rightImage}
            alt="Right Image"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "auto", height: "auto" }}
          />
        </div>

        <div className="right-top-gradient">
          <Image
            src={leftImage}
            alt="Left Image"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
      </div>

      {children}
    </div>
  );
}
