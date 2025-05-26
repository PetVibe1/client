"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { getDistinctSpecies } from '../../services/petService'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'

interface SpeciesDropdownProps {
  className?: string
  onSpeciesSelect?: (species: string) => void
}

export default function SpeciesDropdown({ 
  className = '', 
  onSpeciesSelect 
}: SpeciesDropdownProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [species, setSpecies] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedSpecies, setSelectedSpecies] = useState<string>('')
  
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        setLoading(true)
        const speciesList = await getDistinctSpecies()
        setSpecies(speciesList)
        
        // Check if there's a selected species in URL
        const urlSpecies = searchParams.get('species')
        if (urlSpecies && speciesList.includes(urlSpecies)) {
          setSelectedSpecies(urlSpecies)
        }
      } catch (error) {
        console.error('Error fetching species:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSpecies()
  }, [searchParams])
  
  const handleSpeciesSelect = (selected: string) => {
    setSelectedSpecies(selected)
    
    if (onSpeciesSelect) {
      onSpeciesSelect(selected)
    } else {
      // If no callback provided, update URL with selected species
      const params = new URLSearchParams(searchParams.toString())
      params.set('species', selected)
      router.push(`?${params.toString()}`)
    }
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`w-full justify-between ${className}`} disabled={loading}>
          {loading 
            ? 'Đang tải...' 
            : selectedSpecies 
              ? selectedSpecies 
              : 'Chọn loài thú cưng'}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {species.length > 0 ? (
          species.map(item => (
            <DropdownMenuItem
              key={item}
              className="cursor-pointer"
              onClick={() => handleSpeciesSelect(item)}
            >
              {item}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>Không có dữ liệu</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 