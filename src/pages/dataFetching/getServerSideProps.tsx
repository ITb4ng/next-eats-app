import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
 
 

export const getServerSideProps: GetServerSideProps<{
// Fetch data from external API
    number: number;
}> = (async () => { 
  const num = await fetch('https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain')
  const number = await num.json()
  // Pass data to the page via props
  return { props: { number } }
}) 

export default function Page({
  number,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
        <h1>getServerSideProps</h1>
        <p>number : {number}</p>
    </div>
  )
}