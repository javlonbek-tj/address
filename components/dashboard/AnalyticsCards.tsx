'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CARDS_DATA } from './constants';

export interface AnalyticsCardsProps {
  counts: {
    regions: number;
    districts: number;
    mahallas: number;
    streets: number;
    properties: number;
  };
}

export function AnalyticsCards({ counts }: AnalyticsCardsProps) {
  const cards = CARDS_DATA({ counts });
  return (
    <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          <Card className="bg-white/50 dark:bg-slate-900/50 hover:shadow-lg backdrop-blur-sm border-slate-200 hover:border-blue-500/30 dark:border-slate-500 dark:hover:border-slate-100 h-full transition-all duration-400 cursor-pointer">
            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
              <CardTitle className="font-medium text-slate-500 dark:text-slate-400 text-sm">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="font-bold text-slate-900 dark:text-slate-50 text-2xl"
              >
                {card.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
