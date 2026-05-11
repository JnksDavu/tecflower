import Lottie from 'lottie-react';
import purpleLoaderAnimation from '@/assets/Purple loader.json';
import purpleLoadingAnimation from '@/assets/Purple loading animation.json';

export const FullPagePurpleLoader = ({  }: { label?: string }) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-[#fffdf9] px-6 text-center">
    <div className="w-full max-w-[240px]">
      <Lottie animationData={purpleLoaderAnimation} loop />
    </div>
  </div>
);

export const PurpleLoadingAnimation = ({
  label,
  className = 'w-full max-w-[180px]',
}: {
  label?: string;
  className?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-6 text-center">
    <div className={className}>
      <Lottie animationData={purpleLoadingAnimation} loop />
    </div>
    {label ? <p className="mt-2 text-sm font-medium text-[#7B5CE6]">{label}</p> : null}
  </div>
);
