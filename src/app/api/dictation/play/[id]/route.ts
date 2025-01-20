import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement game retrieval logic
    return NextResponse.json({
      message: 'Get dictation for play',
      id: params.id
    })
  } catch (error) {
    console.error('Error retrieving dictation:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve dictation' },
      { status: 500 }
    )
  }
} 