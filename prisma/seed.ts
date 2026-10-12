import { PrismaClient, MatchStatus, EventType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (order matters due to foreign keys)
  await prisma.matchEvent.deleteMany();
  await prisma.score.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();

  console.log('🗑️  Cleaned existing data');

  // Create teams
  const teams = await Promise.all([
    prisma.team.create({
      data: { name: 'India', country: 'India', logoUrl: 'https://example.com/india.png' },
    }),
    prisma.team.create({
      data: { name: 'Australia', country: 'Australia', logoUrl: 'https://example.com/australia.png' },
    }),
    prisma.team.create({
      data: { name: 'Brazil', country: 'Brazil', logoUrl: 'https://example.com/brazil.png' },
    }),
    prisma.team.create({
      data: { name: 'Germany', country: 'Germany', logoUrl: 'https://example.com/germany.png' },
    }),
    prisma.team.create({
      data: { name: 'Argentina', country: 'Argentina', logoUrl: 'https://example.com/argentina.png' },
    }),
    prisma.team.create({
      data: { name: 'England', country: 'England', logoUrl: 'https://example.com/england.png' },
    }),
  ]);

  console.log(`✅ Created ${teams.length} teams`);

  const [india, australia, brazil, germany, argentina, england] = teams;

  // Create matches
  const now = new Date();

  const match1 = await prisma.match.create({
    data: {
      homeTeamId: india.id,
      awayTeamId: australia.id,
      venue: 'Wankhede Stadium, Mumbai',
      startTime: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
      status: MatchStatus.LIVE,
    },
  });

  const match2 = await prisma.match.create({
    data: {
      homeTeamId: brazil.id,
      awayTeamId: germany.id,
      venue: 'Maracanã Stadium, Rio de Janeiro',
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // tomorrow
      status: MatchStatus.SCHEDULED,
    },
  });

  const match3 = await prisma.match.create({
    data: {
      homeTeamId: argentina.id,
      awayTeamId: england.id,
      venue: 'Estadio Monumental, Buenos Aires',
      startTime: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      status: MatchStatus.COMPLETED,
    },
  });

  console.log('✅ Created 3 matches');

  // Create scores
  await prisma.score.create({
    data: { matchId: match1.id, homeScore: 2, awayScore: 1 },
  });

  await prisma.score.create({
    data: { matchId: match3.id, homeScore: 3, awayScore: 2 },
  });

  console.log('✅ Created scores for LIVE and COMPLETED matches');

  // Create events for Match 1 (India vs Australia - LIVE)
  await prisma.matchEvent.createMany({
    data: [
      { matchId: match1.id, type: EventType.GOAL, minute: 15, player: 'Virat Kohli', detail: 'Header from corner' },
      { matchId: match1.id, type: EventType.YELLOW_CARD, minute: 22, player: 'David Warner', detail: 'Rough tackle' },
      { matchId: match1.id, type: EventType.GOAL, minute: 32, player: 'Rohit Sharma', detail: 'Penalty kick' },
      { matchId: match1.id, type: EventType.GOAL, minute: 40, player: 'Steve Smith', detail: 'Long range shot' },
      { matchId: match1.id, type: EventType.HALF_TIME, minute: 45, player: null, detail: 'Half time whistle' },
    ],
  });

  // Create events for Match 3 (Argentina vs England - COMPLETED)
  await prisma.matchEvent.createMany({
    data: [
      { matchId: match3.id, type: EventType.GOAL, minute: 10, player: 'Lionel Messi', detail: 'Solo run and finish' },
      { matchId: match3.id, type: EventType.GOAL, minute: 25, player: 'Harry Kane', detail: 'Tap in from cross' },
      { matchId: match3.id, type: EventType.RED_CARD, minute: 38, player: 'Kyle Walker', detail: 'Professional foul' },
      { matchId: match3.id, type: EventType.GOAL, minute: 55, player: 'Lionel Messi', detail: 'Free kick' },
      { matchId: match3.id, type: EventType.GOAL, minute: 70, player: 'Harry Kane', detail: 'Penalty conversion' },
      { matchId: match3.id, type: EventType.GOAL, minute: 85, player: 'Paulo Dybala', detail: 'Counter attack goal' },
      { matchId: match3.id, type: EventType.FULL_TIME, minute: 90, player: null, detail: 'Full time whistle' },
    ],
  });

  console.log('✅ Created match events');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
