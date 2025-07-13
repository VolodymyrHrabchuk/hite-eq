import React, { useState } from "react";

type TraitsCardProps = {
  width?: string;
  competitiveness?: number;
  composure?: number;
  confidence?: number;
  commitment?: number;
};

const TraitsCard: React.FC<TraitsCardProps> = ({
  width,
  competitiveness,
  composure,
  confidence,
  commitment,
}) => {
  const traits = [
    { label: "Competitiveness", value: competitiveness ?? 4, color: "#B2FF8B" },
    { label: "Composure", value: composure ?? 5, color: "#FFCBD7" },
    { label: "Confidence", value: confidence ?? 7, color: "#E0CEFF" },
    { label: "Commitment", value: 5, color: "#FEE1B5" },
  ];

  return (
    <div className='grid grid-cols-2 gap-2  items-center justify-center'>
      {traits.map(({ label, value, color }) => (
        <div
          key={label}
          className=' h-[111px] p-4 flex flex-col justify-between gap-8 rounded-xl bg-black/20 border border-white/20 text-white'
          style={{ width }}
        >
          <div className='flex justify-between items-center w-full'>
            <div className='flex space-x-0.5 space-x-reverse'>
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor:
                      i < value ? color : "rgba(255,255,255,0.1)",
                  }}
                  className='w-[5px] h-6 rounded-sm'
                />
              ))}
            </div>
            <span className='text-2xl font-semibold'>{value.toFixed(1)}</span>
          </div>

          <div className='flex items-center justify-between w-full'>
            <span className='text-md'>{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TraitsCard;
