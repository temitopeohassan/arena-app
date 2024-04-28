






"use client";

import { useState, useRef } from 'react';
import  PinataClient  from '@pinata/sdk';
import { useAccount, useWriteContract } from "wagmi";
import deployedContractsData from "~~/contracts/deployedContracts";
import { notification } from '~~/utils/scaffold-eth';
import { IntegerInput } from "~~/components/scaffold-eth";
import { InputBase } from "~~/components/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";



const AddProperty: React.FC = () => {
  const { address: connectedAddress } = useAccount();
  const contractName: ContractName = 'PropertyShares'; 
  const { writeContract } = useWriteContract();

  const [propertyName, setPropertyName] = useState('');
  const [totalShares, setTotalShares] = useState('');
  const [sharePrice, setSharePrice] = useState('');
  const [propertyImage, setPropertyImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const YOUR_PINATA_API_KEY = process.env.YOUR_PINATA_API_KEY;
const YOUR_PINATA_API_SECRET = process.env.YOUR_PINATA_API_SECRET

const pinata = new PinataClient(YOUR_PINATA_API_KEY, YOUR_PINATA_API_SECRET);

const handleAddProperty = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!propertyImage) {
    alert('Please select an image for the property.');
    return;
  }

  try {
    const fileContent = await convertImageToBase64(propertyImage);
    const fileBlob = await fetch(fileContent).then((res) => res.blob());
    const readableStream = fileBlob.stream(); // Create a readable stream from the file

    const pinataMetadata = {
      name: propertyImage.name, // Provide the filename as metadata
      customMetadata: {
        // Add any additional metadata you need here
      },
    };

    const uploadResponse = await pinata.pinFileToIPFS(readableStream, {
      pinataMetadata,
    });

    const image = uploadResponse.IpfsHash;

    const totalSharesBigInt = BigInt(totalShares);
    const sharePriceBigInt = BigInt(sharePrice);

    const contractData = deployedContractsData[31337][contractName];
    const tx = await writeContract({
      abi: contractData.abi,
      address: contractData.address,
      functionName: 'createProperty',
      args: [propertyName, totalSharesBigInt, sharePriceBigInt, image],
    });

    notification.success('Property added successfully');
    console.log('Redirecting to list properties');
  } catch (error) {
    console.error('Error adding property:', error);
    notification.error('Error adding property: ' + error.message);
  }
};



  return (
    <>
      <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
        <h1>Add Property</h1>
        <form onSubmit={handleAddProperty}>
          <div className="flex justify-between gap-2 pb-0.5">
            <label htmlFor="propertyName">Property Name:</label>
            <InputBase
              name="propertyName"
              value={propertyName}
              onChange={(value) => setPropertyName(value || '')} 
            />
          </div>
          <div className="flex justify-between gap-2">
            <label htmlFor="totalShares">Total Shares:</label>
            <IntegerInput
              name="totalShares"
              value={totalShares}
              onChange={(value) => setTotalShares(value.toString())} 
            />
          </div>
          <div className="flex justify-between gap-2">
            <label htmlFor="sharePrice">Share Price (ETH):</label>
            <IntegerInput
              name="sharePrice"
              value={sharePrice}
              onChange={(value) => setSharePrice(value.toString())} 
            />
          </div>
          <div className="flex justify-between gap-2">
            <label htmlFor="propertyImage">Property Image:</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPropertyImage(file);
                }
              }}
            />
          </div>
          <button className="btn btn-secondary btn-sm" type="submit">Add Property</button>
        </form>
      </div>
    </>
  );
};

export default AddProperty;
