<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type ComponentPublicInstance } from 'vue'
import { Bar, Line, Scatter } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import storyData from './data/story.json'
import skuData from './data/skus.json'

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

type Category = 'Snacks' | 'Household Cleaning' | 'Personal Care'
type CategoryFilter = Category | 'All'

type StoryRow = {
  month: string
  category: Category
  totalSales: number
  promoSales: number
  baselineSales: number
  marginRate: number
  promoWeeksThisMonth: number
  avgTransactionValue: number
}

type SkuRow = {
  id: string
  name: string
  category: Category
  promoWeeksTotal: number
  baselineSalesDelta: number
}

const categoryOptions = ['Snacks', 'Household Cleaning', 'Personal Care'] as const
const categoryColors: Record<Category, string> = {
  Snacks: '#DC2626',
  'Household Cleaning': '#92400E',
  'Personal Care': '#0F766E',
}

const story = storyData as StoryRow[]
const skus = skuData as SkuRow[]
const selectedCategory = ref<Category>('Snacks')
const selectedScatterCategory = ref<CategoryFilter>('All')
const chapterRefs = ref<(HTMLElement | null)[]>([])
const activeChapter = ref(0)
const chapterVisible = ref(false)
const chapterLabels = ['The Setup', 'The Surface Story', 'The Twist', 'The Pattern', 'The Takeaway']

const monthLabels = computed(() => {
  const uniqueMonths = [...new Set(story.filter((row) => row.category === selectedCategory.value).map((row) => row.month))]
  return uniqueMonths
})

const categoryTotals = computed(() => {
  return Object.fromEntries(
    categoryOptions.map((category) => [
      category,
      story
        .filter((row) => row.category === category)
        .reduce((sum, row) => sum + row.totalSales, 0),
    ]),
  ) as Record<Category, number>
})

const chapterOneData = computed(() => ({
  labels: [...categoryOptions] as string[],
  datasets: [
    {
      label: 'Total sales',
      data: categoryOptions.map((category) => categoryTotals.value[category]),
      backgroundColor: categoryOptions.map((category) => categoryColors[category]),
      borderRadius: 0,
      borderSkipped: false,
    },
  ],
}))

const chapterTwoData = computed(() => {
  const filtered = story.filter((row) => row.category === selectedCategory.value)
  return {
    labels: filtered.map((row) => row.month),
    datasets: [
      {
        label: 'Baseline sales',
        data: filtered.map((row) => row.baselineSales),
        backgroundColor: categoryColors[selectedCategory.value],
        borderColor: categoryColors[selectedCategory.value],
        borderWidth: 0,
        borderRadius: 0,
      },
      {
        label: 'Promo sales',
        data: filtered.map((row) => row.promoSales),
        backgroundColor: '#D6D3D1',
        borderColor: '#D6D3D1',
        borderWidth: 0,
        borderRadius: 0,
      },
    ],
  }
})

const chapterThreeData = computed(() => ({
  labels: monthLabels.value,
  datasets: categoryOptions.map((category) => {
    const rows = story.filter((row) => row.category === category)
    return {
      label: category,
      data: rows.map((row) => row.baselineSales),
      borderColor: categoryColors[category],
      backgroundColor: categoryColors[category],
      borderWidth: category === 'Personal Care' ? 3 : 2,
      pointRadius: category === 'Personal Care' ? 2 : 1,
      pointHoverRadius: category === 'Personal Care' ? 4 : 2,
      tension: 0.3,
      fill: false,
    }
  }),
}))

const filteredSkuRows = computed(() => {
  const source = selectedScatterCategory.value === 'All' ? skus : skus.filter((sku) => sku.category === selectedScatterCategory.value)
  return source
})

const chapterFourData = computed(() => ({
  datasets: [
    {
      label: 'SKU impact',
      data: filteredSkuRows.value.map((sku) => ({
        x: sku.promoWeeksTotal,
        y: sku.baselineSalesDelta,
        name: sku.name,
        category: sku.category,
        promoWeeksTotal: sku.promoWeeksTotal,
        baselineSalesDelta: sku.baselineSalesDelta,
      })),
      pointBackgroundColor: filteredSkuRows.value.map((sku) => categoryColors[sku.category]),
      pointBorderColor: '#FAFAF9',
      pointBorderWidth: 1,
      pointRadius: 5,
      pointHoverRadius: 7,
    },
  ],
}))

const chapterOneOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
}

const chapterTwoOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        boxWidth: 10,
        usePointStyle: true,
        pointStyle: 'circle',
        color: '#1C1917',
      },
    },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#1C1917', font: { size: 10 } },
    },
    y: {
      display: false,
    },
  },
}

const chapterThreeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'line',
        color: '#1C1917',
      },
    },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#1C1917', maxRotation: 0 },
    },
    y: {
      grid: { color: 'rgba(28,25,23,0.08)' },
      ticks: {
        color: '#1C1917',
        callback: (value: string | number) => `$${Number(value).toLocaleString()}`,
      },
    },
  },
}

const chapterFourOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const { name, category, promoWeeksTotal, baselineSalesDelta } = context.raw as {
            name: string
            category: string
            promoWeeksTotal: number
            baselineSalesDelta: number
          }
          return `${name} · ${category} · ${promoWeeksTotal} promo weeks · ${baselineSalesDelta}%`
        },
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: 'Promo weeks total', color: '#1C1917' },
      grid: { color: 'rgba(28,25,23,0.08)' },
      ticks: { color: '#1C1917' },
      min: 0,
      max: 18,
    },
    y: {
      title: { display: true, text: 'Baseline sales delta (%)', color: '#1C1917' },
      grid: { color: 'rgba(28,25,23,0.08)' },
      ticks: { color: '#1C1917' },
      min: -35,
      max: 10,
    },
  },
}

const currency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

const totalRevenueByCategory = computed(() => {
  return Object.fromEntries(
    categoryOptions.map((category) => [category, story.filter((row) => row.category === category).reduce((sum, row) => sum + row.totalSales, 0)]),
  ) as Record<Category, number>
})

const comparisonRows = computed(() => [
  {
    metric: 'Total Revenue',
    values: {
      Snacks: currency(totalRevenueByCategory.value.Snacks),
      'Household Cleaning': currency(totalRevenueByCategory.value['Household Cleaning']),
      'Personal Care': currency(totalRevenueByCategory.value['Personal Care']),
    },
  },
  {
    metric: 'Avg Margin Rate',
    values: {
      Snacks: `${(story.filter((row) => row.category === 'Snacks').reduce((sum, row) => sum + row.marginRate, 0) / 18).toFixed(2)}%`,
      'Household Cleaning': `${(story.filter((row) => row.category === 'Household Cleaning').reduce((sum, row) => sum + row.marginRate, 0) / 18).toFixed(2)}%`,
      'Personal Care': `${(story.filter((row) => row.category === 'Personal Care').reduce((sum, row) => sum + row.marginRate, 0) / 18).toFixed(2)}%`,
    },
  },
  {
    metric: 'Baseline Sales Trend',
    values: {
      Snacks: '-18%',
      'Household Cleaning': 'Flat',
      'Personal Care': '+6%',
    },
  },
  {
    metric: 'Promo Dependency',
    values: {
      Snacks: '63.9%',
      'Household Cleaning': '43.1%',
      'Personal Care': '25.0%',
    },
  },
])

const chapterObserver = () => {
  const nodes = chapterRefs.value.filter(Boolean) as HTMLElement[]
  if (!nodes.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (visible) {
        const index = Number((visible.target as HTMLElement).dataset.index)
        activeChapter.value = index
        chapterVisible.value = index === 2
      }
    },
    {
      threshold: [0.35, 0.55, 0.75],
    },
  )

  nodes.forEach((node) => observer.observe(node))

  return observer
}

let observer: IntersectionObserver | undefined

onMounted(() => {
  observer = chapterObserver()
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

const setChapterRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) {
    chapterRefs.value[index] = el as HTMLElement
  }
}
</script>

<template>
  <v-app class="story-app">
    <v-app-bar app fixed class="story-app-bar" elevation="0">
      <v-container class="story-topbar"> 
        <div class="story-brand">The Promo Trap</div>
        <div class="story-progress" aria-label="Story chapter progress">
          <span
            v-for="(label, index) in chapterLabels"
            :key="label"
            class="progress-dot"
            :class="{ active: activeChapter === index, complete: activeChapter > index }"
            :title="label"
          />
        </div>
      </v-container>
    </v-app-bar>

    <v-main class="story-main">
      <v-container class="story-shell">
        <section
          class="story-chapter"
          :data-index="0"
          :ref="(el) => setChapterRef(el, 0)"
        >
          <div class="chapter-kicker">Chapter 1</div>
          <h1>The Setup</h1>
          <p>
            Retail teams love a good promo. But when frequency climbs too high, the sales mix begins to hide the real problem: the category is buying volume with discount dollars and eroding the baseline the business depends on.
          </p>
          <p>
            The pressure looks familiar across categories at first. Revenue stays healthy on the surface, but underneath the same story is taking shape.
          </p>

          <div class="chart-card small-chart">
            <Bar :data="chapterOneData" :options="chapterOneOptions" />
          </div>
        </section>

        <section
          class="story-chapter"
          :data-index="1"
          :ref="(el) => setChapterRef(el, 1)"
        >
          <div class="chapter-kicker">Chapter 2</div>
          <h2>The Surface Story</h2>
          <p>
            At first glance, the promo-heavy story looks successful. More sales are pushed through the door, and a lot of that lift is still visible in the total mix.
          </p>

          <v-btn-toggle v-model="selectedCategory" mandatory class="chapter-toggle" color="primary">
            <v-btn value="Snacks">Snacks</v-btn>
            <v-btn value="Household Cleaning">Household Cleaning</v-btn>
            <v-btn value="Personal Care">Personal Care</v-btn>
          </v-btn-toggle>

          <div class="chart-card">
            <Bar :data="chapterTwoData" :options="chapterTwoOptions" />
          </div>
        </section>

        <section
          class="story-chapter"
          :data-index="2"
          :ref="(el) => setChapterRef(el, 2)"
        >
          <div class="chapter-kicker">Chapter 3</div>
          <h2>The Twist</h2>
          <p>
            The turning point is not promo volume in the aggregate. It is the baseline — the non-promoted sales line that decides whether a category grows or simply becomes more expensive to defend.
          </p>

          <div class="chart-card chart-with-annotation">
            <Line :data="chapterThreeData" :options="chapterThreeOptions" />
            <div v-if="chapterVisible" class="chart-annotation">Baseline starts declining here</div>
          </div>
        </section>

        <section
          class="story-chapter"
          :data-index="3"
          :ref="(el) => setChapterRef(el, 3)"
        >
          <div class="chapter-kicker">Chapter 4</div>
          <h2>The Pattern</h2>
          <p>
            The pattern is not random. The most heavily promoted SKUs are the ones that lose the most baseline demand, even when their sales still look strong in the short term.
          </p>

          <v-btn-toggle v-model="selectedScatterCategory" mandatory class="chapter-toggle" color="primary">
            <v-btn value="All">All</v-btn>
            <v-btn value="Snacks">Snacks</v-btn>
            <v-btn value="Household Cleaning">Household Cleaning</v-btn>
            <v-btn value="Personal Care">Personal Care</v-btn>
          </v-btn-toggle>

          <div class="chart-card">
            <Scatter :data="chapterFourData" :options="chapterFourOptions" />
          </div>
        </section>

        <section
          class="story-chapter"
          :data-index="4"
          :ref="(el) => setChapterRef(el, 4)"
        >
          <div class="chapter-kicker">Chapter 5</div>
          <h2>The Takeaway</h2>
          <p>
            The category that promoted least protected its margin most. A lower promo cadence kept the baseline healthier, preserved customer value, and gave the brand room to hold pricing power without subsidizing demand artificially.
          </p>
          <p>
            Snacks looked healthy in the short term, but a frequent promo schedule flattened its baseline and accelerated margin leakage. Household Cleaning stayed balanced. Personal Care gained share without depending on discounting.
          </p>

          <div class="comparison-card">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Snacks</th>
                  <th>Household Cleaning</th>
                  <th class="teal-highlight">Personal Care</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in comparisonRows" :key="row.metric">
                  <td>{{ row.metric }}</td>
                  <td>{{ row.values.Snacks }}</td>
                  <td>{{ row.values['Household Cleaning'] }}</td>
                  <td class="teal-highlight">{{ row.values['Personal Care'] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </v-container>
    </v-main>
  </v-app>
</template>
