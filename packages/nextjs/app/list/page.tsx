





"use client";

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi'; 
import { useScaffoldReadContract } from '~~/hooks/scaffold-eth'; 


interface Property {
  propertyId: number;
  owner: string;
  name: string;
  totalShares: string;
  sharePrice: string;
  sharesSold: string;
}

const ListProperties: React.FC = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();

  const { data: propertiesData } = useScaffoldReadContract<Property[]>({
    contractName: 'PropertyShares', 
    functionName: 'properties', 
    watch: true,
    cacheOnBlock: true,
  });

  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (!propertiesData) return;

    const fetchProperties = async () => {
      const fetchedProperties: Property[] = propertiesData.map((property: Property) => ({
        propertyId: property.propertyId,
        owner: property.owner,
        name: property.name,
        totalShares: property.totalShares.toString(),
        sharePrice: property.sharePrice.toString(),
        sharesSold: property.sharesSold.toString(),
      }));
      setProperties(fetchedProperties);
    };

    fetchProperties();
  }, [propertiesData]);

  return (
    <>
      <div className="flex items-center flex-col pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">List of Properties</span>
          </h1>
        </div>
      </div>
      <div className="flex justify-center">
        {isConnected && !isConnecting ? (
          <ul>
            {properties.map((property, index) => (
              <li key={index}>
                <strong>Property ID:</strong> {property.propertyId}<br />
                <strong>Owner:</strong> {property.owner}<br />
                <strong>Name:</strong> {property.name}<br />
                <strong>Total Shares:</strong> {property.totalShares}<br />
                <strong>Share Price:</strong> {property.sharePrice} ETH<br />
                <strong>Shares Sold:</strong> {property.sharesSold}<br />
                <hr />
              </li>
            ))}
          </ul>
        ) : (
          <p>Please connect your wallet</p>
        )}
      </div>
    </>
  );
};

export default ListProperties;
